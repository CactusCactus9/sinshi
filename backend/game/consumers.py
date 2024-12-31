
# from channels.generic.websocket import AsyncWebsocketConsumer
# import json
# import asyncio
# import math

# #this is working 
# class PongConsumer(AsyncWebsocketConsumer):
#     game_loop_running = False
#     gameOver = False
#     players = {}  # Track player roles: {channel_name: 'leftPlayer' or 'rightPlayer'}
#     room_group_name = 'game_room'
#     ball = {'x': 500, 'y': 350, 'radius': 15, 'speed': 9, 'color': 'white', 'velocityX': 9, 'velocityY': 9}
#     rightPlayer = {'x': 980, 'y': 0, 'w': 20, 'h': 120, 'color': '#E84172', 'score': 0}
#     leftPlayer = {'x': 0, 'y': 0, 'w': 20, 'h': 120, 'color': '#D8FD62', 'score': 0}


#     async def connect(self):
#         self.user = self.scope["user"]
#         user_id = self.user.id
#         channel_name = self.channel_name
#         print("USER IN CONSUMER======", self.user.email)
#         print("USER ID:::::::::::::::", self.user.id)

#         # Reject if the user already has a connection
#         if any(player['user_id'] == user_id for player in PongConsumer.players.values()):
#             print(f"User{self.user.email} AAAALREADY CONNECTED")
#             await self.close()
#             return

#         # Add channel to group
#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#         # Assign roles: first client is leftPlayer, second is rightPlayer
#         if len(PongConsumer.players) == 0:
#             role = 'leftPlayer'
#         elif len(PongConsumer.players) == 1:
#             role = 'rightPlayer'
#         else:
#             # Reject additional connections beyond two players
#             print("------ROOOOM FULL")
#             await self.close()
#             return

#         #Save player details
#         PongConsumer.players[channel_name] = {'user_id': user_id, 'role': role}
#         # print(f"666Assigned role: {role} to user {user_id} on channel {channel_name}")

#         for channel, player in PongConsumer.players.items():
#             print(f"CHANNE: {channel} - USER: {player['user_id']} - Role: {player['role']}")

#         # Start the game loop if not already running
#         if not PongConsumer.game_loop_running:
#             PongConsumer.game_loop_running = True
#             asyncio.create_task(self.game_loop())

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
#         # Remove the player from the players mapping
#         if self.channel_name in PongConsumer.players:
#             del PongConsumer.players[self.channel_name]
#         if self.gameOver:
#             PongConsumer.game_loop_running = False

#     def check_collision(self, paddle):
#         paddle_top = paddle['y']
#         paddle_bottom = paddle['y'] + paddle['h']
#         paddle_right = paddle['x'] + paddle['w']
#         paddle_left = paddle['x']

#         ball_top = self.ball['y'] - self.ball['radius']
#         ball_bottom = self.ball['y'] + self.ball['radius']
#         ball_right = self.ball['x'] + self.ball['radius']
#         ball_left = self.ball['x'] - self.ball['radius']

#         return (
#             ball_left <= paddle_right and ball_top <= paddle_bottom and ball_bottom >= paddle_top and ball_right >= paddle_left
#         )

#     async def reset_ball(self):
#         self.ball['x'] = 500
#         self.ball['y'] = 350
#         self.ball['velocityX'] *= -1  # Reverse direction
#         self.ball['speed'] = 9

#     async def update_ball(self):
#         self.ball['x'] += self.ball['velocityX']
#         self.ball['y'] += self.ball['velocityY']

#         if self.ball['y'] + self.ball['radius'] > 700 or self.ball['y'] - self.ball['radius'] < 0:
#             self.ball['velocityY'] *= -1

#         paddle = self.rightPlayer if self.ball['x'] > 500 else self.leftPlayer
#         if self.check_collision(paddle):
#             angleRad = math.pi / 4 if self.ball['velocityY'] > 0 else -math.pi / 4
#             direction = 1 if self.ball['x'] < 500 else -1
#             self.ball['velocityX'] = math.cos(angleRad) * self.ball['speed'] * direction
#             self.ball['velocityY'] = math.sin(angleRad) * self.ball['speed']
#             self.ball['speed'] += 0.1

#         if self.ball['x'] - self.ball['radius'] <= 0:  # Right player scores
#             self.rightPlayer['score'] += 1
#             if self.rightPlayer['score'] == 3:
#                 await self.broadcast_winner("rightPlayer")
#             await self.reset_ball()
#         elif self.ball['x'] + self.ball['radius'] >= 1000:  # Left player scores
#             self.leftPlayer['score'] += 1
#             if self.leftPlayer['score'] == 3:
#                 await self.broadcast_winner("leftPlayer")
#             await self.reset_ball()
        
#         print(f"score right : {self.rightPlayer['score']}")
#         print(f"score left : {self.leftPlayer['score']}")
#         # if (self.leftPlayer['score'] == 3 or self.rightPlayer['score'] == 3):
#         #     self.leftPlayer['score'] = 0
#         #     self.rightPlayer['score'] = 0
#         #     await self.reset_ball()


#     async def broadcast_winner(self, winner):
#         self.gameOver = True
#         PongConsumer.game_loop_running = False
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'game_over',
#                 'winner': winner
#             }
#         )
#         await asyncio.sleep(2)
#         self.rightPlayer['score'] = 0
#         self.leftPlayer['score'] = 0
#         self.gameOver = True


#     async def game_over(self, event):
#         await self.send(text_data=json.dumps({
#             'winner': event['winner']
#         }))


#     async def game_update(self, event):
#         # Send the updated game state to the client
#         await self.send(text_data=json.dumps({
#             'ball': event.get('ball'),
#             'leftPlayer': event.get('leftPlayer'),
#             'rightPlayer': event.get('rightPlayer'),
#         }))

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         print(f"data received: {data}")
#         # Determine the role of the client sending the message
#         role = PongConsumer.players.get(self.channel_name)

#         # Update the corresponding paddle based on the client's role
#         if role == 'leftPlayer' and 'leftPlayer' in data:
#             self.leftPlayer['y'] = max(0, min(700 - self.leftPlayer['h'], data['leftPlayer']['y']))
#             self.leftPlayer['score'] = data['leftPlayer']['score']
#             # self.leftPlayer['score'] = data['leftPlayer']['score']
#         elif role == 'rightPlayer' and 'rightPlayer' in data:
#             self.rightPlayer['y'] = max(0, min(700 - self.rightPlayer['h'], data['rightPlayer']['y']))
#             self.rightPlayer['score'] = data['rightPlayer']['score']

#         # Broadcast the updated paddle positions immediately
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'game_update',
#                 'ball': self.ball,
#                 'leftPlayer': self.leftPlayer,
#                 'rightPlayer': self.rightPlayer,
#             }
#         )

#     async def game_loop(self):
#         while True:
#             print(f"gameOver : {PongConsumer.game_over}")

#             if self.gameOver:
#                 await asyncio.sleep(0.1)
#                 continue
#             # Update the ball's position
#             await self.update_ball()

#             # Broadcast the entire game state (including paddle positions)
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'game_update',
#                     'ball': self.ball,
#                     'leftPlayer': self.leftPlayer,
#                     'rightPlayer': self.rightPlayer,
#                 }
#             )
#             await asyncio.sleep(1 / 60)  # 60 FPS
#             print(f"end of a loop")




# from channels.generic.websocket import AsyncWebsocketConsumer
# import json
# import asyncio
# import math

# #this is working 
# class PongConsumer(AsyncWebsocketConsumer):
#     game_loop_running = False
#     gameOver = False
#     players = {}  # Track player roles: {channel_name: 'leftPlayer' or 'rightPlayer'}
#     room_group_name = 'game_room'
#     ball = {'x': 500, 'y': 350, 'radius': 15, 'speed': 9, 'color': 'white', 'velocityX': 9, 'velocityY': 9}
#     rightPlayer = {'x': 980, 'y': 0, 'w': 20, 'h': 120, 'color': '#E84172', 'score': 0}
#     leftPlayer = {'x': 0, 'y': 50, 'w': 20, 'h': 120, 'color': '#D8FD62', 'score': 0}
#     previous_state = None

#     async def connect(self):
#         self.user = self.scope["user"]
#         user_id = self.user.id
#         channel_name = self.channel_name
#         print("USER IN CONSUMER======", self.user.email)
#         print("USER ID:::::::::::::::", self.user.id)

#         # Reject if the user already has a connection
#         if any(player['user_id'] == user_id for player in PongConsumer.players.values()):
#             print(f"User{self.user.email} AAAALREADY CONNECTED")
#             await self.close()
#             return

#         # Add channel to group
#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#         # Assign roles: first client is leftPlayer, second is rightPlayer
#         if len(PongConsumer.players) == 0:
#             role = 'leftPlayer'
#         elif len(PongConsumer.players) == 1:
#             role = 'rightPlayer'
#         else:
#             # Reject additional connections beyond two players
#             print("------ROOOOM FULL")
#             await self.close()
#             return

#         #Save player details
#         PongConsumer.players[channel_name] = {'user_id': user_id, 'role': role}

#         for channel, player in PongConsumer.players.items():
#             print(f"CHANNE: {channel} - USER: {player['user_id']} - Role: {player['role']}")

#         # Start the game loop if not already running
#         if not PongConsumer.game_loop_running:
#             PongConsumer.game_loop_running = True
#             asyncio.create_task(self.game_loop())

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
#         # Remove the player from the players mapping
#         if self.channel_name in PongConsumer.players:
#             del PongConsumer.players[self.channel_name]
#         if self.gameOver:
#             PongConsumer.game_loop_running = False

#     def check_collision(self, paddle):
#         paddle_top = paddle['y']
#         paddle_bottom = paddle['y'] + paddle['h']
#         paddle_right = paddle['x'] + paddle['w']
#         paddle_left = paddle['x']

#         ball_top = self.ball['y'] - self.ball['radius']
#         ball_bottom = self.ball['y'] + self.ball['radius']
#         ball_right = self.ball['x'] + self.ball['radius']
#         ball_left = self.ball['x'] - self.ball['radius']

#         return (
#             ball_left <= paddle_right and ball_top <= paddle_bottom and ball_bottom >= paddle_top and ball_right >= paddle_left
#         )

#     async def reset_ball(self):
#         self.ball['x'] = 500
#         self.ball['y'] = 350
#         self.ball['velocityX'] *= -1  # Reverse direction
#         self.ball['speed'] = 9

#     async def update_ball(self):
#         self.ball['x'] += self.ball['velocityX']
#         self.ball['y'] += self.ball['velocityY']

#         if self.ball['y'] + self.ball['radius'] > 700 or self.ball['y'] - self.ball['radius'] < 0:
#             self.ball['velocityY'] *= -1

#         paddle = self.rightPlayer if self.ball['x'] > 500 else self.leftPlayer
#         if self.check_collision(paddle):
#             angleRad = math.pi / 4 if self.ball['velocityY'] > 0 else -math.pi / 4
#             direction = 1 if self.ball['x'] < 500 else -1
#             self.ball['velocityX'] = math.cos(angleRad) * self.ball['speed'] * direction
#             self.ball['velocityY'] = math.sin(angleRad) * self.ball['speed']
#             self.ball['speed'] += 0.1

#         if self.ball['x'] - self.ball['radius'] <= 0:  # Right player scores
#             self.rightPlayer['score'] += 1
#             if self.rightPlayer['score'] == 20:
#                 await self.broadcast_winner("rightPlayer")
#             await self.reset_ball()
#         elif self.ball['x'] + self.ball['radius'] >= 1000:  # Left player scores
#             self.leftPlayer['score'] += 1
#             if self.leftPlayer['score'] == 20:
#                 await self.broadcast_winner("leftPlayer")
#             await self.reset_ball()


#     async def broadcast_winner(self, winner):
#         self.gameOver = True
#         PongConsumer.game_loop_running = False
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'game_over',
#                 'winner': winner
#             }
#         )
#         await asyncio.sleep(2)
#         self.rightPlayer['score'] = 0
#         self.leftPlayer['score'] = 0
#         self.gameOver = True


#     async def game_over(self, event):
#         await self.send(text_data=json.dumps({
#             'winner': event['winner']
#         }))


#     async def game_update(self, event):
#         # Send the updated game state to the client
#         await self.send(text_data=json.dumps({
#             'ball': event.get('ball'),
#             'leftPlayer': event.get('leftPlayer'),
#             'rightPlayer': event.get('rightPlayer'),
#         }))

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         print(f"data received in consumer: {data}")
#         # Determine the role of the client sending the message
#         role = PongConsumer.players[self.channel_name]

#         # Update the corresponding paddle based on the client's role
#         if role == 'leftPlayer' and 'leftPlayer' in data:
#             self.leftPlayer['y'] = max(0, min(700 - self.leftPlayer['h'], data['leftPlayer']['y']))
#             self.leftPlayer['score'] = data['leftPlayer']['score']
#             # self.leftPlayer['score'] = data['leftPlayer']['score']
#         elif role == 'rightPlayer' and 'rightPlayer' in data:
#             self.rightPlayer['y'] = max(0, min(700 - self.rightPlayer['h'], data['rightPlayer']['y']))
#             self.rightPlayer['score'] = data['rightPlayer']['score']

#         # Broadcast the updated paddle positions immediately
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'game_update',
#                 'ball': self.ball,
#                 'leftPlayer': self.leftPlayer,
#                 'rightPlayer': self.rightPlayer,
#             }
#         )

#     async def game_loop(self):
#         previous_state = None
#         while not self.gameOver:
#             current_state = {
#                 # 'ball': self.ball,
#                 'leftPlayer': self.leftPlayer['y'],
#                 'rightPlayer': self.rightPlayer['y'],
#                 'scores':(self.leftPlayer['score'], self.rightPlayer['score'])
#             }
#             if current_state != previous_state:
#                 print(f"UPDATED STATE: {current_state}")
#                 previous_state = current_state

#             await self.update_ball()

#             # Broadcast the entire game state (including paddle positions)
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'game_update',
#                     'ball': self.ball,
#                     'leftPlayer': self.leftPlayer,
#                     'rightPlayer': self.rightPlayer,
#                 }
#             )
#             await asyncio.sleep(1 / 60)  # 60 FPS
#             # print(f"end of a loop")


from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
import math

#this is working 
class PongConsumer(AsyncWebsocketConsumer):
    game_loop_running = False
    gameOver = False
    players = {}  # Track player roles: {channel_name: 'leftPlayer' or 'rightPlayer'}
    # room_group_name = 'game_room'
    ball = {'x': 500, 'y': 350, 'radius': 15, 'speed': 9, 'color': 'white', 'velocityX': 9, 'velocityY': 9}
    rightPlayer = {'x': 980, 'y': 0, 'w': 20, 'h': 120, 'color': '#E84172', 'score': 0}
    leftPlayer = {'x': 0, 'y': 0, 'w': 20, 'h': 120, 'color': '#D8FD62', 'score': 0}

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['gameId']
        self.room_group_name = f'game_{self.game_id}'  # Use game-specific room
        self.user = self.scope["user"]
        user_id = self.user.id
        # channel_name = self.channel_name
        print("USER IN CONSUMER======", self.user.email)
        print("USER ID:::::::::::::::", self.user.id)

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Assign roles: first client is leftPlayer, second is rightPlayer
        if len(PongConsumer.players) == 0:
            self.role = 'leftPlayer'
        elif len(PongConsumer.players) == 1:
            self.role = 'rightPlayer'
        else:
            # Reject additional connections beyond two players
            await self.close()
            return
        
        #Save player details
        if not self.room_group_name in PongConsumer.players:
            PongConsumer.players[self.room_group_name] = [{'user_id': user_id, 'role': self.role}]
        else:
            PongConsumer.players[self.room_group_name] += [{'user_id': user_id, 'role': self.role}]
        print(self.players)
        # for channel, player in PongConsumer.players.items():
        #     print(f"CHANNE: {channel} - USER: {player['user_id']} - Role: {player['role']}")

        # Start the game loop if not already running
        if not PongConsumer.game_loop_running:
            PongConsumer.game_loop_running = True
            asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        # Remove the player from the players mapping
        if self.channel_name in PongConsumer.players:
            del PongConsumer.players[self.channel_name]
        if self.gameOver:
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
            if self.rightPlayer['score'] == 130:
                await self.broadcast_winner("rightPlayer")
            await self.reset_ball()
        elif self.ball['x'] + self.ball['radius'] >= 1000:  # Left player scores
            self.leftPlayer['score'] += 1
            if self.leftPlayer['score'] == 130:
                await self.broadcast_winner("leftPlayer")
            await self.reset_ball()
        
        # print(f"score right : {self.rightPlayer['score']}")
        # print(f"score left : {self.leftPlayer['score']}")
        # if (self.leftPlayer['score'] == 3 or self.rightPlayer['score'] == 3):
        #     self.leftPlayer['score'] = 0
        #     self.rightPlayer['score'] = 0
        #     await self.reset_ball()


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


    async def game_update(self, event):
        # Send the updated game state to the client
        await self.send(text_data=json.dumps({
            'role': event.get('role'),
            'ball': event.get('ball'),
            'leftPlayer': event.get('leftPlayer'),
            'rightPlayer': event.get('rightPlayer'),
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"data received: {data}")
        # Determine the role of the client sending the message
        role = PongConsumer.players.get(self.channel_name)

        # Update the corresponding paddle based on the client's role
        if role == 'leftPlayer' and 'leftPlayer' in data:
            self.leftPlayer['y'] = max(0, min(700 - self.leftPlayer['h'], data['leftPlayer']['y']))
            self.leftPlayer['score'] = data['leftPlayer']['score']
        elif role == 'rightPlayer' and 'rightPlayer' in data:
            self.rightPlayer['y'] = max(0, min(700 - self.rightPlayer['h'], data['rightPlayer']['y']))
            self.rightPlayer['score'] = data['rightPlayer']['score']

        # Broadcast the updated paddle positions immediately
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'role': self.role,
                'ball': self.ball,
                'leftPlayer': self.leftPlayer,
                'rightPlayer': self.rightPlayer,
            }
        )

    async def game_loop(self):
        while True:
            # print(f"gameOver : {PongConsumer.game_over}")

            if self.gameOver:
                await asyncio.sleep(0.1)
                continue
            # Update the ball's position
            await self.update_ball()

            # Broadcast the entire game state (including paddle positions)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_update',
                    'role': self.role,
                    'ball': self.ball,
                    'leftPlayer': self.leftPlayer,
                    'rightPlayer': self.rightPlayer,
                }
            )
            await asyncio.sleep(1 / 60)  # 60 FPS
            # print(f"end of a loop")