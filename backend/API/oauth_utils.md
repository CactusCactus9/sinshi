# 42 OAuth Utils Documentation

## Overview
The `FortyTwoOAuth` class handles OAuth 2.0 authentication with 42's API. This document explains the implementation, flow, and usage of the OAuth authentication system.

## Class: FortyTwoOAuth

## Flow Simplified :

Step 1: Get Permission
User -> "Hey, I want to log in with 42"
App -> Sends user to 42's login page (get_auth_url())

Step 2: Exchange Codes
42 -> Gives a temporary code
App -> Exchanges code for access token (get_access_token())

Step 3: Get Info
App -> Uses token to get user info (get_user_info())

### Endpoints
```python
AUTH_URL = 'https://api.intra.42.fr/oauth/authorize'
TOKEN_URL = 'https://api.intra.42.fr/oauth/token'
USER_URL = 'https://api.intra.42.fr/v2/me'
```

### Configuration
Required settings in Django's `settings.py`:
```python
FORTY_TWO_CLIENT_ID = 'your_client_id'
FORTY_TWO_CLIENT_SECRET = 'your_client_secret'
FORTY_TWO_REDIRECT_URI = 'your_callback_url'
```

## Methods

### 1. `__init__()`
**Purpose**: Initializes OAuth handler with required credentials.

**Validation**:
- Checks for presence of all required OAuth configuration
- Raises ValueError if any settings are missing

### 2. `get_auth_url()`
**Purpose**: Generates the authorization URL for 42 OAuth login.

**Parameters**:
```python
params = {
    'client_id': self.client_id,
    'redirect_uri': self.redirect_uri,
    'response_type': 'code',
    'scope': 'public'
}
```

**Returns**: URL string where users will be redirected to log in.

**Example URL**:
```
https://api.intra.42.fr/oauth/authorize?client_id=xxx&redirect_uri=xxx&response_type=code&scope=public
```

### 3. `get_access_token(code)`
**Purpose**: Exchanges authorization code for access token.

**Parameters**:
- `code`: Authorization code received from 42's OAuth callback

**Request Body**:
```python
data = {
    'grant_type': 'authorization_code',
    'client_id': self.client_id,
    'client_secret': self.client_secret,
    'code': code,
    'redirect_uri': self.redirect_uri
}
```

**Returns**: Dictionary containing:
- `access_token`
- `refresh_token`
- Other OAuth response data

**Error Handling**:
- Timeout after 10 seconds
- Raises exception with detailed error message

### 4. `get_user_info(access_token)`
**Purpose**: Retrieves user information from 42 API.

**Parameters**:
- `access_token`: OAuth access token

**Headers**:
```python
headers = {'Authorization': f'Bearer {access_token}'}
```

**Returns**: User information JSON including:
- Email
- Login
- Profile details

## Complete OAuth Flow

1. **Initiate Login**:
   ```python
   oauth = FortyTwoOAuth()
   auth_url = oauth.get_auth_url()
   # Redirect user to auth_url
   ```

2. **Handle Callback**:
   ```python
   # After user authorizes
   token_data = oauth.get_access_token(callback_code)
   user_info = oauth.get_user_info(token_data['access_token'])
   ```

3. **Create/Update User**:
   ```python
   user, created = User.objects.update_or_create(
       email=user_info['email'],
       defaults={
           'refresh_token': token_data.get('refresh_token', '')
       }
   )
   ```

## Error Handling
The class implements robust error handling:
```python
try:
    response = requests.post(self.TOKEN_URL, data=data, timeout=10)
    response.raise_for_status()
except RequestException as e:
    raise Exception(f"Failed to get access token: {str(e)}")
```

## Security Considerations
1. All credentials stored in Django settings
2. HTTPS used for all API requests
3. 10-second timeout on API calls
4. Bearer token authentication
5. Error messages don't expose sensitive data

## Dependencies
- `requests`: For HTTP requests
- `django.conf`: For accessing settings
- `requests.exceptions`: For error handling

## Integration Points
- Works with User model for storing user data
- Connects with UserProfile through signals
- Used by views for authentication flow
- Returns data via UserSerializer

## Testing
To test OAuth flow:
1. Configure test credentials
2. Mock API responses
3. Test each method independently
4. Verify error handling
5. Check user creation/update flow

Example test:
```python
def test_oauth_flow():
    oauth = FortyTwoOAuth()
    auth_url = oauth.get_auth_url()
    assert 'client_id' in auth_url
    assert 'redirect_uri' in auth_url
```