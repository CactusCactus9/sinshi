from rest_framework import serializers
from .models import ChatRoom, ChatParticipant, ChatMessage
from API.serializers import UserSerializer

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'chat_room', 'sender', 'content', 'created_at']
        read_only_fields = ['sender']

class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'is_direct_message', 'created_at', 'created_by']
        read_only_fields = ['created_by']