from .models import Requestship
from .models import Game
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import Q
import json
import asyncio
import math
from urllib.parse import parse_qs

# url_route {'args': (), 'kwargs': {'userId': 1}}
class InviteConsumer(AsyncWebsocketConsumer):
      players = {}
      async def connect(self):
         # InviteConsumer.players = {}
         await self.accept()
         self.user = self.scope['user']
         self.invite_id = self.scope["url_route"]["kwargs"]["inviteId"]
         # print("userid---->:", self.user.id)
         # print('********user*******:', self.user, 'inviteId:', self.invite_id)
         # self.user_group_name = f"invite_{self.user.id}"

         request_ship = await self.get_request_ship()

         if self.invite_id not in InviteConsumer.players:
            # print("#####################")
            InviteConsumer.players[self.invite_id] = []
         
         # if request_ship:
         #    # print(f"Requestship found: {request_ship}")
         # else:
         #    print("No matching Requestship found.")
            
         if request_ship:
            InviteConsumer.players[self.invite_id].append(self)
         
         # print("leeeeeen___>:",len(InviteConsumer.players[self.invite_id]))

         if len(InviteConsumer.players[self.invite_id]) == 2:
            game = await self.create_game()
            if game:
               await InviteConsumer.players[self.invite_id][0].send(text_data=json.dumps({
                 'type': 'game_created',
                 'game_id': game.id,
                 'player1': game.player1.id,
                 'player2': game.player2.id,
                 'status': game.status,
               }))
               await InviteConsumer.players[self.invite_id][1].send(text_data=json.dumps({
                 'type': 'game_created',
                 'game_id': game.id,
                 'player1': game.player1.id,
                 'player2': game.player2.id,
                 'status': game.status,
               }))
               # print(f"Game notification sent to frontend: {game}")
            else:
               await self.send(text_data=json.dumps({
                 'type': 'error',
                 'message': 'Failed to create game.',
               }))

            
                

         # print("---------------[", f"Current players: {InviteConsumer.players}", "]---------------------")

      async def  disconnect(self, close_code):
         # print("Disconnecting...")
      #    # InviteConsumer.players.clear()
      #    print("$$$$$$$$$$:", InviteConsumer.players)
      # #   Remove the user from the specific invite_id group
      #    if self.invite_id in InviteConsumer.players:
      #       InviteConsumer.players[self.invite_id] = [
      #          player for player in InviteConsumer.players[self.invite_id]
      #             if player.id != self.user.id
      #       ]
      #       # Clean up empty invite_id entries
         if self.invite_id in InviteConsumer.players:
            del InviteConsumer.players[self.invite_id]



      #    await self.send(text_data=json.dumps({
      #       'type': 'game_created',
      #       'game_id': game.id,
      #       'player1': game.player1.id,
      #       'player2': game.player2.id,
      #       'status': game.status,
      #   }))
      #   print(f"Game notification sent to frontend: {game}")
         # print(f"Updated players after disconnect: {InviteConsumer.players}")
         

      @database_sync_to_async
      def get_request_ship(self):
         try:
            request_ship = Requestship.objects.get(
                  Q(sender_id=self.user.id) | Q(receiver_id=self.user.id)
            )
            return request_ship
         except Requestship.DoesNotExist:
            return None
      
      @database_sync_to_async
      def create_game(self):
         try:
            player1 = InviteConsumer.players[self.invite_id][0].user
            player2 = InviteConsumer.players[self.invite_id][1].user
    
            game = Game.objects.create(
                player1=player1,
                player2=player2,
            )
            # print(f"Game created successfully: {game}")
            return game
         except Exception as e:
             print(f"Error creating game: {e}")
             return None