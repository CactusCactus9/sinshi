from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.ChatRoomListCreateView.as_view(), name='chat-rooms'),
    path('rooms/<int:room_id>/messages/', 
         views.ChatMessageListCreateView.as_view(), 
         name='chat-messages'),
]
