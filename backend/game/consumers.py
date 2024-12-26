from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
import math
from urllib.parse import parse_qs

#this is working 
class PongConsumer(AsyncWebsocketConsumer):
    game_loop_running = False
    players = {}  # Track player roles: {channel_name: 'leftPlayer' or 'rightPlayer'}
    room_group_name = 'game_room'
    ball = {'x': 500, 'y': 350, 'radius': 15, 'speed': 9, 'color': 'white', 'velocityX': 9, 'velocityY': 9}
    rightPlayer = {'x': 980, 'y': 0, 'w': 20, 'h': 120, 'color': '#E84172', 'score': 0}
    leftPlayer = {'x': 0, 'y': 0, 'w': 20, 'h': 120, 'color': '#D8FD62', 'score': 0}


    async def connect(self):

        # query_string = self.scope['query_string'].decode()
        # query_params = parse_qs(query_string)
        # token = query_params.get('token', [None])[0]
        # print(f"\t->Token: {token}")

        self.user = self.scope['user']


        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Assign roles: first client is leftPlayer, second is rightPlayer
        # if len(PongConsumer.players) == 0:
        #     PongConsumer.players[self.channel_name] = 'leftPlayer'
        # elif len(PongConsumer.players) == 1:
        #     PongConsumer.players[self.channel_name] = 'rightPlayer'
        # else:
        #     # Reject additional connections beyond two players
        #     await self.close()

        # # Start the game loop if not already running
        # if not PongConsumer.game_loop_running:
        #     PongConsumer.game_loop_running = True
        #     asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        # Remove the player from the players mapping
        if self.channel_name in PongConsumer.players:
            del PongConsumer.players[self.channel_name]

    def check_collision(self, paddle):
        paddle_top = paddle['y']
        paddle_bottom = paddle['y'] + paddle['h']
        paddle_right = paddle['x'] + paddle['w']
        paddle_left = paddle['x']

        ball_top = self.ball['y'] - self.ball['radius']
        ball_bottom = self.ball['y'] + self.ball['radius']
        ball_right = self.ball['x'] + self.ball['radius']
        ball_left = self.ball['x'] - self.ball['radius']

        return (
            ball_left <= paddle_right and ball_top <= paddle_bottom and ball_bottom >= paddle_top and ball_right >= paddle_left
        )

    async def reset_ball(self):
        self.ball['x'] = 500
        self.ball['y'] = 350
        self.ball['velocityX'] *= -1  # Reverse direction
        self.ball['speed'] = 9

    async def update_ball(self):
        self.ball['x'] += self.ball['velocityX']
        self.ball['y'] += self.ball['velocityY']

        if self.ball['y'] + self.ball['radius'] > 700 or self.ball['y'] - self.ball['radius'] < 0:
            self.ball['velocityY'] *= -1

        paddle = self.rightPlayer if self.ball['x'] > 500 else self.leftPlayer
        if self.check_collision(paddle):
            angleRad = math.pi / 4 if self.ball['velocityY'] > 0 else -math.pi / 4
            direction = 1 if self.ball['x'] < 500 else -1
            self.ball['velocityX'] = math.cos(angleRad) * self.ball['speed'] * direction
            self.ball['velocityY'] = math.sin(angleRad) * self.ball['speed']
            self.ball['speed'] += 0.1

        if self.ball['x'] - self.ball['radius'] <= 0:  # Right player scores
            self.rightPlayer['score'] += 1
            if self.rightPlayer['score'] == 3:
                await self.broadcast_winner("rightPlayer")
            await self.reset_ball()
        elif self.ball['x'] + self.ball['radius'] >= 1000:  # Left player scores
            self.leftPlayer['score'] += 1
            if self.leftPlayer['score'] == 3:
                await self.broadcast_winner("leftPlayer") 
            await self.reset_ball()
        
        # print(f"score right : {self.rightPlayer['score']}")
        # print(f"score left : {self.leftPlayer['score']}")
        # if (self.leftPlayer['score'] == 3 or self.rightPlayer['score'] == 3):
        #     self.leftPlayer['score'] = 0
        #     self.rightPlayer['score'] = 0
        #     await self.reset_ball()


    async def broadcast_winner(self, winner):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_over',
                'winner': winner
            }
        )

    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'winner': event['winner']
        }))

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

        # Determine the role of the client sending the message
        role = PongConsumer.players.get(self.channel_name)

        # Update the corresponding paddle based on the client's role
        if role == 'leftPlayer' and 'leftPlayer' in data:
            self.leftPlayer['y'] = max(0, min(700 - self.leftPlayer['h'], data['leftPlayer']['y']))
            self.leftPlayer['score'] = data['leftPlayer']['score']
            # self.leftPlayer['score'] = data['leftPlayer']['score']
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
