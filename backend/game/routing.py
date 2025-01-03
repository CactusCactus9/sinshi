from django.urls import path
from .consumers import PongConsumer
from .consumerInvite import InviteConsumer


websocket_urlpatterns = [
    path("ws/game/<int:gameId>", PongConsumer.as_asgi()),
    path("ws/invite/<int:inviteId>", InviteConsumer.as_asgi()),
]