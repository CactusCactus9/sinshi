# from rest_framework import serializers
# from ./models import Game
from rest_framework import serializers
from .models import Requestship, User
# from friends import models

class UserSerializer(serializers.ModelSerializer):

    username = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id','username' ,'avatar', 'email', 'status', 'level']
    
    def get_username(self, obj):
        return obj.profile.display_name

    def get_level(self, obj):
        return obj.profile.level
    
    def get_avatar(self, obj):
        return f'http://localhost:8000/media/{obj.avatar}'
    

class RequestshipSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Requestship
        fields = ['id', 'sender', 'receiver', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


# class GameSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Game
#         fields = "__all__"