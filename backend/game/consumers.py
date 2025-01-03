

from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
import math

class PongConsumer(AsyncWebsocketConsumer):
    game_loop_running = False
    gameOver = False
    players = {}


    async def connect(self):
        self.ball = {'x': 500, 'y': 350, 'radius': 15, 'speed': 9, 'color': 'white', 'velocityX': 9, 'velocityY': 9}
        self.rightPlayer = {'x': 980, 'y': 0, 'w': 20, 'h': 120, 'color': "#E84172", 'score': 0}
        self.leftPlayer = {'x': 0, 'y': 0, 'w': 20, 'h': 120, 'color': "#D8FD62", 'score': 0}
        self.game_id = self.scope['url_route']['kwargs']['gameId']
        self.room_group_name = f'game_{self.game_id}'
        self.user = self.scope["user"]
        
        self.paddle_speed = 10
        self.canvas_height = 700
        self.paddle_height = 120

        if self.game_id not in PongConsumer.players:
            PongConsumer.players[self.game_id] = {'leftPlayer': None, 'rightPlayer': None, 'playerL': self.leftPlayer, 'playerR': self.rightPlayer}

        if PongConsumer.players[self.game_id]['leftPlayer'] is None:
            self.role = 'leftPlayer'
            PongConsumer.players[self.game_id]['leftPlayer'] = self.channel_name
        elif PongConsumer.players[self.game_id]['rightPlayer'] is None:
            self.role = 'rightPlayer'
            PongConsumer.players[self.game_id]['rightPlayer'] = self.channel_name
        else:
            await self.close()
            return

        # print(f"Player {self.role} connected: {self.channel_name}")
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        if not PongConsumer.game_loop_running:
            PongConsumer.game_loop_running = True
            asyncio.create_task(self.game_loop())

    async def receive(self, text_data):
        data = json.loads(text_data)
        move = data.get('move')
        print(">>>>> ", self.role ," move:", move)
        if self.role == 'rightPlayer' and move == 'up':
            self.players[self.game_id]['playerR']['y'] = max(0, self.players[self.game_id]['playerR']['y'] - self.paddle_speed)
        if self.role == 'leftPlayer' and move == 'up':
            self.players[self.game_id]['playerL']['y'] = max(0, self.players[self.game_id]['playerL']['y'] - self.paddle_speed)


        if self.role == 'rightPlayer' and move == 'down':
            self.players[self.game_id]['playerR']['y'] = min(self.canvas_height - self.paddle_height, 
                                  self.players[self.game_id]['playerR']['y'] + self.paddle_speed)
        if self.role == 'leftPlayer' and move == 'down':
            self.players[self.game_id]['playerL']['y'] = min(self.canvas_height - self.paddle_height, 
                                 self.players[self.game_id]['playerL']['y'] + self.paddle_speed)

        await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'paddles_update',
                    'leftPlayer': self.players[self.game_id]['playerL'],
                    'rightPlayer': self.players[self.game_id]['playerR'],
                }
            )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
        #clear game
        if self.game_id in PongConsumer.players:
            if PongConsumer.players[self.game_id]['leftPlayer'] == self.channel_name:
                PongConsumer.players[self.game_id]['leftPlayer'] = None
                PongConsumer.players[self.game_id]['playerL']['score'] = 0
            elif PongConsumer.players[self.game_id]['rightPlayer'] == self.channel_name:
                PongConsumer.players[self.game_id]['rightPlayer'] = None
                PongConsumer.players[self.game_id]['playerR']['score'] = 0
                
        # If both players are gone, remove the game completely
        if (PongConsumer.players[self.game_id]['leftPlayer'] is None and 
            PongConsumer.players[self.game_id]['rightPlayer'] is None):
                del PongConsumer.players[self.game_id]
                PongConsumer.game_loop_running = False
                self.gameOver = True

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

    async def broadcast_winner(self, winner):
        self.gameOver = True
        PongConsumer.game_loop_running = False
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_over',
                'winner': winner
            }
        )
        await asyncio.sleep(2)
        self.players[self.game_id]['playerR']['score'] = 0
        self.players[self.game_id]['playerL']['score'] = 0
        self.gameOver = True

    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'winner': event['winner']
    }))

    async def update_ball(self):
        self.ball['x'] += self.ball['velocityX']
        self.ball['y'] += self.ball['velocityY']

        if self.ball['y'] + self.ball['radius'] > 700 or self.ball['y'] - self.ball['radius'] < 0:
            self.ball['velocityY'] *= -1

        paddle = self.players[self.game_id]['playerR'] if self.ball['x'] > 500 else self.players[self.game_id]['playerL']
        if self.check_collision(paddle):
            angleRad = math.pi / 4 if self.ball['velocityY'] > 0 else -math.pi / 4
            direction = 1 if self.ball['x'] < 500 else -1
            self.ball['velocityX'] = math.cos(angleRad) * self.ball['speed'] * direction
            self.ball['velocityY'] = math.sin(angleRad) * self.ball['speed']
            self.ball['speed'] += 0.1

        if self.ball['x'] - self.ball['radius'] <= 0:  # Right player scores
            self.players[self.game_id]['playerR']['score'] += 1
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'paddles_update',
                    'leftPlayer': self.players[self.game_id]['playerL'],
                    'rightPlayer': self.players[self.game_id]['playerR'],
                }
        )
            print(self.players[self.game_id]['playerR']['score'])
            if self.players[self.game_id]['playerR']['score'] ==3:
                await self.broadcast_winner("rightPlayer")
            await self.reset_ball()
        elif self.ball['x'] + self.ball['radius'] >= 1000:  # Left player scores
            self.players[self.game_id]['playerL']['score'] += 1
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'paddles_update',
                    'leftPlayer': self.players[self.game_id]['playerL'],
                    'rightPlayer': self.players[self.game_id]['playerR'],
                }
            )
            print(self.players[self.game_id]['playerR']['score'])
            if self.players[self.game_id]['playerL']['score'] == 3:
                await self.broadcast_winner("leftPlayer")
            await self.reset_ball()


    async def ball_update(self, event):
        # Debug print before sending update
        # print(f"Sending game update to client: Left Y: {event.get('leftPlayer', {}).get('y')}, Right Y: {event.get('rightPlayer', {}).get('y')}")
        
        # Send the updated game state to the client
        await self.send(text_data=json.dumps({
            'ball': event.get('ball'),
        }))
    async def paddles_update(self, event):
        # Debug print before sending update
        # print(f"Sending game update to client: Left Y: {event.get('leftPlayer', {}).get('y')}, Right Y: {event.get('rightPlayer', {}).get('y')}")
        
        # Send the updated game state to the client
        await self.send(text_data=json.dumps({
            'leftPlayer': event.get('leftPlayer'),
            'rightPlayer': event.get('rightPlayer'),
        }))

    async def game_loop(self):
        while True:
            #check if both players exist
            if (self.game_id not in self.players or 
                self.players[self.game_id]['leftPlayer'] is None or 
                self.players[self.game_id]['rightPlayer'] is None):
                await asyncio.sleep(0.1)
                continue
            if self.gameOver:
                await asyncio.sleep(0.1)
                continue

            # Update paddle positions
            # await self.update_paddles()
            
            # Update ball position
            await self.update_ball()

            # Broadcast game state
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'ball_update',
                    'ball': self.ball,
                }
            )
            
            await asyncio.sleep(1/60)