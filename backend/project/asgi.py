"""
ASGI config for project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from project.routing import websocket_urlpatterns
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from project.cookieJwtAuthentication import CookieJWTAuthentication  # Import your custom class
from channels.auth import get_user
import json

class JWTAuthMiddleware(BaseMiddleware):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


    def get_access_token_from_cookies(self, headers):
        for key, value in headers:
            if key == b'cookie':
                # Split the cookie header value by ';' to get individual cookies
                cookie_str = value.decode('utf-8')  # Decode bytes to string
                for cookie in cookie_str.split(';'):
                    # Split each cookie by '=' to get the cookie name and value
                    cookie = cookie.strip()
                    if '=' in cookie:
                        name, val = cookie.split('=', 1)
                        if name == 'access':
                            return val
        return None

    async def __call__(self, scope, receive, send):
        # Extract the JWT token from cookies (you can use your custom method)
        cookie_auth = CookieJWTAuthentication()
        access_token = self.get_access_token_from_cookies(scope['headers'])
        user, token = await database_sync_to_async(cookie_auth.socket_authenticate)(access_token)
        # Add user to scope
        scope['user'] = user
        scope['token'] = token
        await super().__call__(scope, receive, send)



application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # HTTP requests
    "websocket": JWTAuthMiddleware(  # WebSocket handling
        URLRouter(
            websocket_urlpatterns
        )
    ),
})




# import os
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter
# from .routing import application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yourproject.settings')
# django_asgi_app = get_asgi_application()

# application = application  # Use the routing from routing.py