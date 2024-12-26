# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

#django channels r designed to work with class based consumers
class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Group for broadcasting messages
        self.room_group_name = 'game_room'

        # Add the client to the group
        #adds this ws connection self.channel_name to game_room group =>group ws clients
        await self.channel_layer.group_add('game_room',self.channel_name)

        await self.accept()  # Accept the WebSocket connection

    async def disconnect(self, close_code):
        # Remove the client from the group
        await self.channel_layer.group_discard(self.room_group_name,self.channel_name)

    async def receive(self, text_data):
        # text_data is JSON string 
        data = json.loads(text_data) #Parse the JSON string into a Python dictionary
        print(f"Hellooooooooo")
#data = {
# 'leftPlayer': {'y': 50}, 
# 'rightPlayer': {'y': 100}
# }
        # Broadcast received data to all group members
        await self.channel_layer.group_send(
            'game_room',
            {
                'type': 'game_update',
                'leftPlayer': data.get('leftPlayer'),#retrieves the value of leftPlayer
                'rightPlayer': data.get('rightPlayer'),
            }
        )

    async def game_update(self, event):#handles the broadcast
        # The `event` dictionary contains the broadcasted data
        # Example: event = {'type': 'game_update', 'leftPlayer': {'y': 50}, 'rightPlayer': {'y': 100}}
        #json.dumps converts py dictionary to JSON string
        await self.send(text_data=json.dumps({
            'leftPlayer': event.get('leftPlayer'),
            'rightPlayer': event.get('rightPlayer'),
        }))
# {
#     "leftPlayer": { "y": 50 },
#     "rightPlayer": { "y": 100 }
# }

