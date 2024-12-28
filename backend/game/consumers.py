
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
import math
from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async

from .models import Game


#this is working 
class PongConsumer(AsyncWebsocketConsumer):
    game_loop_running = False
    players = {}  # Track player roles: {channel_name: 'leftPlayer' or 'rightPlayer'}
    room_group_name = 'game_room'

    ball = {'x': 500, 'y': 350, 'radius': 15, 'speed': 9, 'color': 'white', 'velocityX': 9, 'velocityY': 9}
    rightPlayer = {'x': 980, 'y': 0, 'w': 20, 'h': 120, 'color': '#E84172', 'score': 0}
    leftPlayer = {'x': 0, 'y': 0, 'w': 20, 'h': 120, 'color': '#D8FD62', 'score': 0}


    # async def connect(self):
    #     self.ball = {'x': 500, 'y': 350, 'radius': 15, 'speed': 9, 'color': 'white', 'velocityX': 9, 'velocityY': 9}
    #     self.rightPlayer = {'x': 980, 'y': 0, 'w': 20, 'h': 120, 'color': '#E84172', 'score': 0}
    #     self.leftPlayer = {'x': 0, 'y': 0, 'w': 20, 'h': 120, 'color': '#D8FD62', 'score': 0}
    #     self.room_name = self.scope['url_route']['kwargs']['gameId']##comes from url : 1
    #     self.room_group_name = f'game_{self.room_name}' ###game_1
    #     # query_string = self.scope['query_string'].decode()
    #     # query_params = parse_qs(query_string)
    #     # token = query_params.get('token', [None])[0]
    #     # print(f"\t->Token: {token}")
    #     # print(self.scope)

    #     self.user = self.scope["user"]
    #     print("User in consumer:", self.user)  # This should now show your authenticated user
    #     print("User email:", self.user.id)  # You can access all user fields

    #     # print('----------------------->:',self.user)
    #     # print(f"scope_user {self.user}")
        
    #     await self.channel_layer.group_add(self.room_group_name, self.channel_name)
    #     await self.accept()

    #     # Assign roles: first client is leftPlayer, second is rightPlayer
    #     if len(PongConsumer.players) == 0:
    #         PongConsumer.players[self.user.id] = 'leftPlayer'
    #     elif len(PongConsumer.players) == 1:
    #         PongConsumer.players[self.user.id] = 'rightPlayer'
    #     # else:
    #     #     # Reject additional connections beyond two players
    #     #     await self.close()
    #     for channel, role in PongConsumer.players.items():
    #         print(f"Channel: {self.user.email} - Role: {role}")

    #     # # Start the game loop if not already running
    #     if not PongConsumer.game_loop_running:
    #         PongConsumer.game_loop_running = True
    #         asyncio.create_task(self.game_loop())

    # async def disconnect(self, close_code):
    #     # Remove the player from the players mapping
    #     if self.channel_name in PongConsumer.players:
    #         del PongConsumer.players[self.channel_name]
    #     await self.channel_layer.group_discard(self.room_group_name, self.channel_name)




    

    # ****async def connect(self):
    # ****    self.user = self.scope["user"]
    # ****    user_id = self.user.id
    # ****    
    # ****    channel_name = self.channel_name
# ****
    # ****    print(f"User in consumer: {self.user.email}")
    # ****    print(f"User ID: {user_id}")
    # ****    
    # ****    # Reject if the user already has a connection
    # ****    if any(player['user_id'] == user_id for player in PongConsumer.players.values()):
    # ****        print(f"User {self.user.email} already connected. Rejecting additional connection.")
    # ****        await self.close()
    # ****        return
# ****
    # ****    # Add channel to group
    # ****    await self.channel_layer.group_add(self.room_group_name, self.channel_name)
    # ****    await self.accept()
# ****
    # ****    # Assign roles to new connections
    # ****    if len(PongConsumer.players) == 0:
    # ****        role = 'leftPlayer'
    # ****    elif len(PongConsumer.players) == 1:
    # ****        role = 'rightPlayer'
    # ****    else:
    # ****        # Reject connections beyond two players
    # ****        print("+++++++Room full. Rejecting connection.")
    # ****        await self.close()
    # ****        return
# ****
    # ****    # Save player details
    # ****    PongConsumer.players[channel_name] = {'user_id': user_id, 'role': role}
    # ****    print(f"Assigned role: {role} to user {self.user.email} on channel {channel_name}")
# ****
    # ****    # Log all players
    # ****    for channel, player in PongConsumer.players.items():
    # ****        print(f"Channel: {channel} - User: {player['user_id']} - Role: {player['role']}")
# ****
    # ****    # Start the game loop if not already running
    # ****    if not PongConsumer.game_loop_running:
    # ****        PongConsumer.game_loop_running = True
    # ****        asyncio.create_task(self.game_loop())

    # async def disconnect(self, close_code):
    #     channel_name = self.channel_name
    #     # Remove player from tracking
    #     if channel_name in PongConsumer.players:
    #         del PongConsumer.players[channel_name]

    #     await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    #     print(f"Disconnected user on channel {channel_name}")

    # def check_collision(self, paddle):
    #     paddle_top = paddle['y']
    #     paddle_bottom = paddle['y'] + paddle['h']
    #     paddle_right = paddle['x'] + paddle['w']
    #     paddle_left = paddle['x']

    #     ball_top = self.ball['y'] - self.ball['radius']
    #     ball_bottom = self.ball['y'] + self.ball['radius']
    #     ball_right = self.ball['x'] + self.ball['radius']
    #     ball_left = self.ball['x'] - self.ball['radius']

    #     return (
    #         ball_left <= paddle_right and ball_top <= paddle_bottom and ball_bottom >= paddle_top and ball_right >= paddle_left
    #     )

    # async def reset_ball(self):
    #     self.ball['x'] = 500
    #     self.ball['y'] = 350
    #     self.ball['velocityX'] *= -1  # Reverse direction
    #     self.ball['speed'] = 9

    # async def update_ball(self):
    #     self.ball['x'] += self.ball['velocityX']
    #     self.ball['y'] += self.ball['velocityY']

    #     if self.ball['y'] + self.ball['radius'] > 700 or self.ball['y'] - self.ball['radius'] < 0:
    #         self.ball['velocityY'] *= -1

    #     paddle = self.rightPlayer if self.ball['x'] > 500 else self.leftPlayer
    #     if self.check_collision(paddle):
    #         angleRad = math.pi / 4 if self.ball['velocityY'] > 0 else -math.pi / 4
    #         direction = 1 if self.ball['x'] < 500 else -1
    #         self.ball['velocityX'] = math.cos(angleRad) * self.ball['speed'] * direction
    #         self.ball['velocityY'] = math.sin(angleRad) * self.ball['speed']
    #         self.ball['speed'] += 0.1

    #     if self.ball['x'] - self.ball['radius'] <= 0:  # Right player scores
    #         self.rightPlayer['score'] += 1
    #         if self.rightPlayer['score'] == 3:
    #             await self.broadcast_winner("rightPlayer")
    #         await self.reset_ball()
    #     elif self.ball['x'] + self.ball['radius'] >= 1000:  # Left player scores
    #         self.leftPlayer['score'] += 1
    #         if self.leftPlayer['score'] == 3:
    #             await self.broadcast_winner("leftPlayer") 
    #         await self.reset_ball()
        
        # print(f"score right : {self.rightPlayer['score']}")
        # print(f"score left : {self.leftPlayer['score']}")
        # if (self.leftPlayer['score'] == 3 or self.rightPlayer['score'] == 3):
        #     self.leftPlayer['score'] = 0
        #     self.rightPlayer['score'] = 0
        #     await self.reset_ball()


    # async def broadcast_winner(self, winner):
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #             'type': 'game_over',
    #             'winner': winner
    #         }
    #     )

    # async def game_over(self, event):
    #     await self.send(text_data=json.dumps({
    #         'winner': event['winner']
    #     }))



    async def connect(self):
        self.user = self.scope["user"]
        self.game_id = self.scope['url_route']['kwargs']['gameId']
        print(f"2222222")
        # Get game instance
        try:
            self.game = await self.get_game()
            if not self.game:
                await self.close()
                return
                
            # Determine player role based on game model
            if self.user == self.game.player1:
                role = 'leftPlayer'
            elif self.user == self.game.player2:
                role = 'rightPlayer'
            else:
                await self.close()
                return
                
            # Add player to game tracking
            PongConsumer.players[self.channel_name] = {
                'user_id': self.user.id,
                'role': role,
                'game_id': self.game_id
            }
            
            await self.channel_layer.group_add(f'game_{self.game_id}', self.channel_name)
            await self.accept()
            
        except Game.DoesNotExist:
            await self.close()
            
    @database_sync_to_async
    def get_game(self):
        return Game.objects.filter(
            id=self.game_id,
            status='active',
        ).first()

    async def game_loop(self):
        while True:
            # Update the ball's position
            await self.update_ball()

            # Broadcast the entire game state (including paddle positions)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_update',
                    'ball': self.ball,
                    'leftPlayer': self.leftPlayer,
                    'rightPlayer': self.rightPlayer,
                }
            )
            await asyncio.sleep(1 / 60)  # 60 FPS

    async def game_update(self, event):
        # Send the updated game state to the client
        await self.send(text_data=json.dumps({
            'ball': event.get('ball'),
            'leftPlayer': event.get('leftPlayer'),
            'rightPlayer': event.get('rightPlayer'),
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"--------///////received data: {data}")
        # Determine the role of the client sending the message
        role = PongConsumer.players.get(self.channel_name, {}).get('role')##updated role

        # Update the corresponding paddle based on the client's role
        if role == 'leftPlayer' and 'leftPlayer' in data:
            self.leftPlayer['y'] = max(0, min(700 - self.leftPlayer['h'], data['leftPlayer']['y']))
            self.leftPlayer['score'] = data['leftPlayer']['score']
            self.leftPlayer['score'] = data['leftPlayer']['score']
        elif role == 'rightPlayer' and 'rightPlayer' in data:
            self.rightPlayer['y'] = max(0, min(700 - self.rightPlayer['h'], data['rightPlayer']['y']))
            self.rightPlayer['score'] = data['rightPlayer']['score']

        # Broadcast the updated paddle positions immediately
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'ball': self.ball,
                'leftPlayer': self.leftPlayer,
                'rightPlayer': self.rightPlayer,
            }
        )
