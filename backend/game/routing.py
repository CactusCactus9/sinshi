from django.urls import path
from .consumers import PongConsumer

websocket_urlpatterns = [
    path("ws/game/<int:gameId>", PongConsumer.as_asgi()),
    # path("ws/game/<int:gameId>/$", PongConsumer.as_asgi()),
]