# Django REST Framework Serializers Documentation
learn more : https://www.django-rest-framework.org/api-guide/serializers/#declaring-serializers
## Overview
This document explains the serializers used in our Django REST Framework (DRF) application. Serializers allow complex data such as querysets and model instances to be converted to native Python datatypes that can then be easily rendered into JSON, XML or other content types.

## Serializer Classes

### 1. UserProfileSerializer
```python
class UserProfileSerializer(serializers.ModelSerializer):
```
**Purpose**: Handles the serialization of UserProfile model instances.

**Fields**:
- `display_name`: User's display name
- `first_name`: User's first name
- `last_name`: User's last name
- `level`: User's game level
- `points`: User's points
- `wins`: Number of wins
- `losses`: Number of losses
- `win_streak`: Current winning streak
- `status`: User's current status

**Example Output**:
```json
{
    "display_name": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "level": 1.0,
    "points": 100,
    "wins": 5,
    "losses": 2,
    "win_streak": 3,
    "status": "ONLINE"
}
```

### 2. UserSerializer
```python
class UserSerializer(serializers.ModelSerializer):
```
**Purpose**: Handles the serialization of User model instances, including nested profile data.

**Fields**:
- `id`: User's unique identifier
- `email`: User's email address
- `avatar`: Path to user's  image
- `is_two_factor_enabled`: 2FA status (read-only)
- `profile`: Nested UserProfile data

**Features**:
- Uses nested serialization for profile data
- Includes read-only fields for security

**Example Output**:
```json
{
    "id": 1,
    "email": "john@example.com",
    "avatar": "/default-avatar.png",
    "is_two_factor_enabled": false,
    "profile": {
        "display_name": "john_doe",
        "first_name": "John",
        // ... other profile fields
    }
}
```

### 3. UserRegistrationSerializer
```python
class UserRegistrationSerializer(serializers.ModelSerializer):
```
**Purpose**: Handles user registration data validation and creation.

**Fields**:
- `email`: User's email address
- `password`: User's password (write-only)
- `password2`: Password confirmation (write-only)
- `display_name`: User's display name (write-only)

**Special Features**:
1. Custom Validation:
   - Ensures passwords match
   ```python
   def validate(self, data):
       if data['password'] != data['password2']:
           raise serializers.ValidationError("Passwords don't match")
       return data
   ```

2. Custom Creation:
   - Creates user account
   - Sets up user profile
   - Handles password hashing through User.objects.create_user()

**Example Input**:
```json
{
    "email": "john@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "display_name": "john_doe"
}
```

## Usage Examples

### Serializing Data (Python → JSON)
```python
# Single user
user_serializer = UserSerializer(user)
user_json = user_serializer.data

# Multiple users
users_serializer = UserSerializer(users, many=True)
users_json = users_serializer.data
```

### Deserializing Data (JSON → Python)
```python
# Registration
serializer = UserRegistrationSerializer(data=request.data)
if serializer.is_valid():
    user = serializer.save()

# Profile update
serializer = UserSerializer(user, data=request.data, partial=True)
if serializer.is_valid():
    updated_user = serializer.save()
```

## Security Considerations
- Passwords are write-only and never included in responses
- Two-factor authentication status is read-only
- Profile updates are properly nested and validated
- Input validation is performed before any database operations

## Dependencies
- Django REST Framework
- Django Models: User, UserProfile