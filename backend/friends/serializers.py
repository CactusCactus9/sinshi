from rest_framework import serializers
from .models import Friendship, User
# from friends import models

class UserSerializer(serializers.ModelSerializer):

    username = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    # friendship_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id','username' ,'avatar', 'email', 'status', 'level']
    
    def get_username(self, obj):
        return obj.profile.display_name

    def get_level(self, obj):
        return obj.profile.level
    
    def get_avatar(self, obj):
        return f'http://localhost:8000/media/{obj.avatar}'
    
    # def get_friendship_status(self, obj):
    #     request = self.context.get('request')
    #     if not request:
    #         return None
        
    #     user = request.user
    #     friendship = Friendship.objects.filter(
    #         models.Q(sender=user, receiver=obj) | models.Q(sender=obj, receiver=user)
    #     ).first()

    #     return friendship.status if friendship else None

class FriendshipSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Friendship
        fields = ['id', 'sender', 'receiver', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']
