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
        
        # Initialize paddle movement state
        self.paddle_states = {
            'leftPlayer': {'up': False, 'down': False},
            'rightPlayer': {'up': False, 'down': False}
        }
        
        self.paddle_speed = 10
        self.canvas_height = 700
        self.paddle_height = 120

        if self.game_id not in PongConsumer.players:
            PongConsumer.players[self.game_id] = {'leftPlayer': None, 'rightPlayer': None}

        if PongConsumer.players[self.game_id]['leftPlayer'] is None:
            self.role = 'leftPlayer'
            PongConsumer.players[self.game_id]['leftPlayer'] = self.channel_name
        elif PongConsumer.players[self.game_id]['rightPlayer'] is None:
            self.role = 'rightPlayer'
            PongConsumer.players[self.game_id]['rightPlayer'] = self.channel_name
        else:
            await self.close()
            return

        print(f"Player {self.role} connected: {self.channel_name}")
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        await self.send(text_data=json.dumps({
            'action': "init_player",
            'role': self.role,
            'ball': self.ball,
        }))

        if not PongConsumer.game_loop_running:
            PongConsumer.game_loop_running = True
            asyncio.create_task(self.game_loop())

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Received data: {data}")
        
        if data.get('action') == 'move':
            key = data.get('key')
            event_type = data.get('type')
            role = data.get('role')
            
            # Only process movement for the correct player
            if role == self.role:
                # Update paddle state
                if key == 'ArrowUp':
                    self.paddle_states[role]['up'] = (event_type == 'keydown')
                    self.paddle_states[role]['down'] = False  # Ensure only one direction at a time
                    print(f"Up key {event_type} for {role}: {self.paddle_states[role]['up']}")
                    
                elif key == 'ArrowDown':
                    self.paddle_states[role]['down'] = (event_type == 'keydown')
                    self.paddle_states[role]['up'] = False  # Ensure only one direction at a time
                    print(f"Down key {event_type} for {role}: {self.paddle_states[role]['down']}")
                
                print(f"Updated paddle states: {self.paddle_states}")

    async def update_paddles(self):
        # Update left paddle
        if self.paddle_states['leftPlayer']['up']:
            self.leftPlayer['y'] = max(0, self.leftPlayer['y'] - self.paddle_speed)
            print(f"Moving left paddle up to {self.leftPlayer['y']}")
        elif self.paddle_states['leftPlayer']['down']:
            self.leftPlayer['y'] = min(self.canvas_height - self.paddle_height, 
                                     self.leftPlayer['y'] + self.paddle_speed)
            print(f"Moving left paddle down to {self.leftPlayer['y']}")

        # Update right paddle
        if self.paddle_states['rightPlayer']['up']:
            self.rightPlayer['y'] = max(0, self.rightPlayer['y'] - self.paddle_speed)
            print(f"Moving right paddle up to {self.rightPlayer['y']}")
        elif self.paddle_states['rightPlayer']['down']:
            self.rightPlayer['y'] = min(self.canvas_height - self.paddle_height, 
                                      self.rightPlayer['y'] + self.paddle_speed)
            print(f"Moving right paddle down to {self.rightPlayer['y']}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
        # Remove the player from the players mapping
        if self.room_group_name in PongConsumer.players:
            PongConsumer.players[self.room_group_name] = [
                player for player in PongConsumer.players[self.room_group_name]
                if player['channel_name'] != self.channel_name
            ]
            # Remove the room if it's empty
            if not PongConsumer.players[self.room_group_name]:
                del PongConsumer.players[self.room_group_name]
        
        # Stop the game loop if the game is over or the room is empty
        if self.gameOver or self.room_group_name not in PongConsumer.players:
            PongConsumer.game_loop_running = False



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
        self.rightPlayer['score'] = 0
        self.leftPlayer['score'] = 0
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

        paddle = self.rightPlayer if self.ball['x'] > 500 else self.leftPlayer
        if self.check_collision(paddle):
            angleRad = math.pi / 4 if self.ball['velocityY'] > 0 else -math.pi / 4
            direction = 1 if self.ball['x'] < 500 else -1
            self.ball['velocityX'] = math.cos(angleRad) * self.ball['speed'] * direction
            self.ball['velocityY'] = math.sin(angleRad) * self.ball['speed']
            self.ball['speed'] += 0.1

        if self.ball['x'] - self.ball['radius'] <= 0:  # Right player scores
            self.rightPlayer['score'] += 1
            if self.rightPlayer['score'] ==130:
                await self.broadcast_winner("rightPlayer")
            await self.reset_ball()
        elif self.ball['x'] + self.ball['radius'] >= 1000:  # Left player scores
            self.leftPlayer['score'] += 1
            if self.leftPlayer['score'] == 130:
                await self.broadcast_winner("leftPlayer")
            await self.reset_ball()
        
        print(f"score right : {self.rightPlayer['score']}")
        print(f"score left : {self.leftPlayer['score']}")



    async def game_update(self, event):
        # Debug print before sending update
        print(f"Sending game update to client: Left Y: {event.get('leftPlayer', {}).get('y')}, Right Y: {event.get('rightPlayer', {}).get('y')}")
        
        # Send the updated game state to the client
        await self.send(text_data=json.dumps({
            'ball': event.get('ball'),
            'leftPlayer': event.get('leftPlayer'),
            'rightPlayer': event.get('rightPlayer'),
        }))

    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     print(f"data received: {data}")
    #     # Determine the role of the client sending the message
    #     role = PongConsumer.players.get(self.channel_name)

    #     # Update the corresponding paddle based on the client's role
    #     if role == 'leftPlayer' and 'leftPlayer' in data:
    #         self.leftPlayer['y'] = max(0, min(700 - self.leftPlayer['h'], data['leftPlayer']['y']))
    #         self.leftPlayer['score'] = data['leftPlayer']['score']
    #         # self.leftPlayer['score'] = data['leftPlayer']['score']
    #     elif role == 'rightPlayer' and 'rightPlayer' in data:
    #         self.rightPlayer['y'] = max(0, min(700 - self.rightPlayer['h'], data['rightPlayer']['y']))
    #         self.rightPlayer['score'] = data['rightPlayer']['score']

    #     # Broadcast the updated paddle positions immediately
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #             'type': 'game_update',
    #             'role': self.role,
    #             'ball': self.ball,
    #             'leftPlayer': self.leftPlayer,
    #             'rightPlayer': self.rightPlayer,
    #         }
    #     )


    async def game_loop(self):
        while True:
            if self.gameOver:
                await asyncio.sleep(0.1)
                continue

            # Update paddle positions
            await self.update_paddles()
            
            # Update ball position
            await self.update_ball()

            # Broadcast game state
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_update',
                    'ball': self.ball,
                    'leftPlayer': self.leftPlayer,
                    'rightPlayer': self.rightPlayer,
                }
            )
            
            await asyncio.sleep(1/60)