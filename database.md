# User Management & Authentication (From Subject Section IV.3):

- Users must subscribe securely
- Implement 2FA
- Remote authentication (OAuth with 42)
- User profiles with stats and avatars
- Friend system with online status
- Match history and stats

# Database Implementation:

User Table:
- Handles basic authentication (email, password)
- 2FA fields (is_two_factor_enabled, two_factor_secret)
- OAuth support via refresh_token
- First-time login tracking

UserProfile Table:
- Gaming statistics (wins, losses, win_streak)
- Display information (avatar, display_name)
- Additional user info (bio, location)
- Points and level system for progression

Friendship Table:
- Manages friend relationships
- Status tracking (pending, accepted, blocked)
- Timestamps for relationship changes

# Game System (From Subject Sections III.3 and IV.4):

- Live Pong game between players
- Tournament support
- Matchmaking system
- Game customization options
- Support for multiple players
- Remote play capability

# Database Implementation:
Game Table:
- Tracks individual game instances
- Supports different game types (PONG, CUSTOM)
- Game status tracking (WAITING, IN_PROGRESS, FINISHED)
- Winner tracking
- Tournament association
- Ranked vs unranked games

GameParticipant Table:
- Links players to games
- Tracks scores
- Records join times
- Supports multiple players per game

Tournament Table:
- Tournament management
- Participant limits
- Status tracking
- Time scheduling

TournamentParticipant Table:
- Player registration
- Status tracking (REGISTERED, CHECKED_IN, ELIMINATED, WINNER)


# Achievement System (For progression and engagement):

Achievement Table:
- Defines available achievements
- Milestone tracking
- Point rewards

UserAchievement Table:
- Tracks earned achievements
- Records achievement dates
- Stores achievement scores

# Chat System (From Subject Section IV.4):

- Direct messages between users
- User blocking capability
- Game invitations through chat
- Tournament notifications
- Access to player profiles through chat

# Database Implementation:

ChatRoom Table:
- Supports both direct messages and group chats
- Tracks room creation and creator
- Room type identification

ChatParticipant Table:
- Manages chat room access
- Admin privileges
- Join time tracking

ChatMessage Table:
- Message content storage
- System message support (for notifications)
- Timestamp tracking

## Key Design Considerations: ##

## Security:

- Password hashing (handled by Django's auth system)
- 2FA support
- Token-based authentication
- Chat room access control

# Performance:

- Appropriate indexes (primary keys, foreign keys)
- Efficient relationships for quick lookups
- Timestamp tracking for data ordering

# Scalability:

- Separate tables for different concerns
- Flexible game system supporting multiple types
- Extensible chat system

# Maintainability:

- Clear table relationships
- Consistent naming conventions
- Status tracking across features
