# Django REST Framework Serializers Documentation

## Overview
Serializers in Django REST Framework convert complex data types (like Django models) into Python native datatypes that can be easily rendered into JSON/XML. They also handle deserialization - converting parsed data back into complex types.

## ChatMessageSerializer

```python
class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'chat_room', 'sender', 'content', 'created_at']
        read_only_fields = ['sender']
```

### Fields Explained:
- `id`: Unique identifier for each message (automatically generated)
- `chat_room`: Foreign key linking to the ChatRoom where message was sent
- `sender`: User who sent the message (read-only, set automatically)
- `content`: The actual message text
- `created_at`: Timestamp when message was created

### Key Features:
1. **Read-only Sender**
   - `sender` field is read-only for security
   - Prevents users from impersonating others
   - Automatically set to the authenticated user

2. **Automatic Validation**
   - Ensures chat_room exists
   - Validates content is not empty
   - Checks data types match model fields

## ChatRoomSerializer

```python
class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'is_direct_message', 'created_at', 'created_by']
        read_only_fields = ['created_by']
```

### Fields Explained:
- `id`: Unique identifier for each chat room
- `name`: Room name/title
- `is_direct_message`: Boolean indicating if room is DM
- `created_at`: Room creation timestamp
- `created_by`: User who created the room (read-only)

### Key Features:
1. **Room Type Control**
   - `is_direct_message` determines chat behavior
   - DMs limited to two participants
   - Group chats allow multiple users

2. **Creator Protection**
   - `created_by` is read-only
   - Set automatically to request user
   - Prevents unauthorized room creation

## Security Considerations
1. Read-only fields prevent unauthorized modifications
2. Authenticated user automatically set as sender/creator
3. Validation ensures data integrity
4. Foreign key relationships maintain referential integrity