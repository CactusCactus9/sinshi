from game.routing import websocket_urlpatterns as game_ws
# from chat import routing.websocket_urlpatterns as chat_ws

websocket_urlpatterns = game_ws
# websocket_urlpatterns += chat_ws


# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from channels.db import database_sync_to_async
# from django.contrib.auth.models import AnonymousUser
# from rest_framework.authtoken.models import Token
# from django.urls import path
# from urllib.parse import parse_qsl
# from game.consumers import PongConsumer  # Update this import path

# def parse_token(query_string):
#     params = dict(parse_qsl(query_string))
#     return params.get(b'token', b'').decode()

# @database_sync_to_async
# def get_user_from_token(token):
#     try:
#         token_obj = Token.objects.get(key=token)
#         return token_obj.user
#     except Token.DoesNotExist:
#         return AnonymousUser()

# class TokenAuthMiddleware:
#     def __init__(self, inner):
#         self.inner = inner

#     async def __call__(self, scope, receive, send):
#         query_string = scope["query_string"].decode()
#         token = parse_token(query_string)
#         user = await get_user_from_token(token)
#         scope["user"] = user
#         return await self.inner(scope, receive, send)

# application = ProtocolTypeRouter({
#     'http': get_asgi_application(),
#     'websocket': AuthMiddlewareStack(
#         URLRouter([
#             path('ws/game/<str:room_name>/', PongConsumer.as_asgi()),
#             # path('ws/pong/', PongConsumer.as_asgi()),
#         ])
#     ),
# })