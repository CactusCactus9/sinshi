# Understanding Chat Models:

- name: Room identifier/title
- CharField: For text with a maximum length
- max_length=255: Standard length for names

- is_direct_message: Distinguishes between DM and group chat
- BooleanField: True/False field
- default=True: New rooms are DMs by default

- created_at: When the room was created

- DateTimeField: Stores date and time
- auto_now_add=True: Automatically sets when record is created

- created_by: Who created the room

- ForeignKey: Creates relationship with User model
- on_delete=models.CASCADE: If user is deleted, delete their rooms
- related_name='created_chat_rooms': Access rooms created by user with user.created_chat_rooms.all()

# Understanding the ChatParticipant Model :

    * Purpose of ChatParticipant:
        - Acts as a "bridge" table between Users and ChatRooms
        - Tracks who's in which chat room
        - Stores additional information about participation

    * Fields explained :

    - chat_room: Link to the ChatRoom
        - ForeignKey: Creates relation to ChatRoom
        - on_delete=models.CASCADE: If room is deleted, delete participation
        - related_name='participants': Access like room.participants.all()
    - user: Link to the User
        -ForeignKey: Creates relation to User
        - on_delete=models.CASCADE: If user is deleted, delete participation
        - related_name='chat_participations': Access like user.chat_participations.all()
    - joined_at:
        - Records when user joined the room
        - auto_now_add=True: Automatically sets current time when created
    - is_admin:
        - Tracks if user has admin privileges in the room
        - default=False: Users start as non-admins
    * Meta Class :
        - Prevents duplicate participants
        - User can't be in same room twice
        - Creates database constraint

# Understanding the ChatMessage Model :

    * Purpose of ChatMessage:
        - Stores actual messages in chat rooms
        - Tracks who sent what and when
        - Distinguishes between user and system messages
    * Fields Explanation: 
        a . chat_room:
            - Links message to specific chat room
            - on_delete=models.CASCADE: If room is deleted, all messages are deleted
            - related_name='messages': Access room's messages with room.messages.all()
        b . sender:
            - Links message to user who sent it
            - on_delete=models.CASCADE: If user is deleted, their messages are deleted
            - related_name='sent_messages': Access user's messages with user.sent_messages.all()
        c . content:
            - Actual message content
            - TextField: For storing text of any length
            - No max_length limit unlike CharField
        d . created_at:
            - When message was created
            - Automatically set when message is created
            - Used for message ordering
        e . is_system_message:
            - Distinguishes between user messages and system notifications
            - Example system messages:
                "User X joined the room"
                "User Y left the room"
    * Meta Class:
        - Sets default ordering by creation time
        - Ensures messages are retrieved in chronological order
        - Affects all queries unless overridden
        
                


