
from django.conf import settings
from django.views.generic import TemplateView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import authentication_classes
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
from .serializers import UserSerializer, UserRegistrationSerializer, UserProfileSerializer
from .models import User
from .oauth_utils import FortyTwoOAuth
from rest_framework_simplejwt.authentication import JWTAuthentication
import pyotp
from django.utils.timezone import now
import qrcode
from io import BytesIO
import base64
import requests
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.password_validation import validate_password



@api_view(['GET'])
def check_login_method(request):

    login_method = request.session.get('login_method', None)

    if login_method == 'intra':
        return Response({'status': 'ok'}, status=200)
    else:
        return Response({'status': 'ko'}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh_token = request.COOKIES.get('refresh')
    if not refresh_token:
        return Response({'error': 'No refresh token'}, status=401)
        
    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        
        response = Response({'message': 'Token refreshed'})
        response.set_cookie(
            'access',
            access_token,
            httponly=True,
            secure=True,
            samesite='Lax'
        )
        return response
    except:
        return Response({'error': 'Invalid refresh token'}, status=401)


@csrf_exempt
@api_view(['GET', 'OPTIONS'])
@permission_classes([IsAuthenticated])
def is_logged_in(request):
    if request.method == 'OPTIONS':
        return Response()
    
    if request.user.is_authenticated:
        return Response({
            'message': 'User is authenticated',
            'user': {
                'email': request.user.email,
            }
        })
    return Response({'message': 'User is not authenticated'}, status=401)

class infoUser(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            print("User-------:", request.user)
            # print("Profile:", getattr(request.user, 'profile', None))
            serializer = UserSerializer(request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("Error details:", str(e))
            return Response(
                {"error": "An error occurred while fetching user information", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if 'email' not in request.data or 'password' not in request.data:
            return Response({"error": "email and password required"}, status=400)

        user = authenticate(email=request.data.get('email'), password=request.data.get('password'))
        
        if not user:
            return Response({'message': "invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        

        request.session['login_method'] = 'email'
        # Check if 2FA is enabled
        if user.is_two_factor_enabled:
            return Response({
                'requires2FA': True,
                'user_id': user.id
            }, status=status.HTTP_200_OK)
        
        # Normal login flow if 2FA not enabled
        response = Response({'message': 'Login successful'})
        print("-------------->:",user.id)
        refresh = RefreshToken.for_user(user)
        user.refresh_token = refresh
        user.status = "Online"
        user.save()

        response.set_cookie(
            key='access',
            value=str(refresh.access_token),
            httponly=True,
            secure=True,
            samesite='Lax',
        )
        response.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite='Lax',
        )
        return response
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.status = "Offline"
        user.refresh_token = ''
        user.save()
        response = Response({'message': 'logout success'})
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response


class RegisterView(generics.CreateAPIView): # CreateAPIView for handling POST requests
    """
    View for user registration
    """
    queryset = User.objects.all()                 # What data it works with
    permission_classes = (AllowAny,)              # Anyone can register
    serializer_class = UserRegistrationSerializer # How data is processed

class UserProfileView(generics.RetrieveUpdateAPIView): # RetrieveUpdateAPIView for GET and PUT/PATCH requests
    """
    View for retrieving and updating user profile
    """
    permission_classes = (IsAuthenticated,)  # Must be logged in
    # serializer_class = UserSerializer        # Uses UserSerializer
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user             # Gets current user's profile


@api_view(['GET'])                          # This decorator marks it as a REST API endpoint
@permission_classes([IsAuthenticated])      # This checks JWT token
def check_auth_status(request):
    """Check if user is authenticated and return user data"""
    # If valid JWT token exists, this runs
    # If not, returns 401 Unauthorized
    serializer = UserSerializer(request.user)
    return Response({
        'isAuthenticated': True,
        'user': serializer.data
    })

@api_view(['GET'])                          # This decorator marks it as a REST API endpoint
@permission_classes([AllowAny])           # Allows anyone to access this endpoint (no login needed)
@authentication_classes([])
def oauth_login(request):
    """
    Initiates the 42 OAuth login process
    """
    oauth = FortyTwoOAuth()
    auth_url = oauth.get_auth_url()
    return Response({'auth_url': auth_url})

@api_view(['GET'])
def protected_route_example(request):
    if not request.user.is_authenticated:
        raise AuthenticationFailed({
            'status': 'error',
            'message': 'Authentication required',
            'code': 'authentication_required'
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_login_2fa(request):
    """Verify 2FA code during login process"""
    user_id = request.data.get('user_id')
    code = request.data.get('code')
    
    if not user_id or not code:
        return Response({'error': 'User ID and code are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Invalid user'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if not user.is_two_factor_enabled:
        return Response({'error': '2FA is not enabled for this user'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Verify 2FA code
    totp = pyotp.TOTP(user.two_factor_secret)
    if not totp.verify(code):
        return Response({'error': 'Invalid 2FA code'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Generate tokens after successful 2FA verification
    refresh = RefreshToken.for_user(user)
    response = Response({'message': 'Login successful'})
    
    response.set_cookie(
        key='access',
        value=str(refresh.access_token),
        httponly=True,
        secure=True,
        samesite='Lax'
    )
    
    response.set_cookie(
        key='refresh',
        value=str(refresh),
        httponly=True,
        secure=True,
        samesite='Lax'
    )
    
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def oauth_42_callback(request):
    try:
        code = request.GET.get('code')
        if not code:
            return redirect('http://localhost:3000/logincallback?status=failed')

        oauth = FortyTwoOAuth()
        token_data = oauth.get_access_token(code)
        access_token = token_data.get('access_token')
        user_info = oauth.get_user_info(access_token)

        avatar_url = user_info.get('image', {}).get('link')
        oauth_id = user_info.get('id')
        #updated
        try:
            user = User.objects.get(id=oauth_id)
            user.status = 'Online'
            user.refresh_token = token_data.get('refresh_token', '')
            user.save()
            created = False
        except User.DoesNotExist:
            email = user_info.get('email')
            user = User.objects.create(
                id=oauth_id,
                email=email,
                status='Online',
                refresh_token=token_data.get('refresh_token', '')
            )
            created = True

        if created or not user.avatar:
            if avatar_url:
                try:
                    response = requests.get(avatar_url)
                    
                    file_name = f"avatars/{user.id}_avatar.jpg"
                    user.avatar.save(file_name, ContentFile(response.content), save=True)
                    print("Avatar image saved successfully.")
                except Exception as e:
                    print(f"Error saving avatar: {e}")
    
        
        # Check if 2FA is enabled for OAuth user
        if user.is_two_factor_enabled:
            # Redirect to frontend 2FA verification page
            return redirect(f'http://localhost:3000/verify-2fa-oauth?user_id={user.id}')
        
        request.session['login_method'] = 'intra'
        # If no 2FA, proceed with normal OAuth login
        refresh = RefreshToken.for_user(user)
        response = redirect('http://localhost:3000/logincallback?status=success')
        response.set_cookie(
            key='access',
            value=str(refresh.access_token),
            httponly=True,
            secure=True,
            samesite='Lax',
            domain='localhost'
        )
        response.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite='Lax',
            domain='localhost'
        )
        return response

    except Exception as e:
        print(f"Error in OAuth Callback: {str(e)}")
        return redirect('http://localhost:3000/logincallback?status=failed')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def two_factor_status(request):
    """Get the current 2FA status for the user"""
    return Response({
        'is_enabled': request.user.is_two_factor_enabled
    })
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def enable_2fa(request):
    """Generate 2FA secret and QR code"""
    print(f"[{now()}] Received 2FA enable request")
    print(f"[{now()}] User authenticated: {request.user.is_authenticated}")
    print(f"[{now()}] User: {request.user}")

    # Check if the user is authenticated
    if not request.user.is_authenticated:
        print(f"[{now()}] User is not authenticated")
        return Response({'error': 'User is not authenticated'}, status=401)

    # Check if 2FA is already enabled
    if request.user.is_two_factor_enabled:
        print(f"[{now()}] 2FA is already enabled for user {request.user.email}")
        return Response({'error': '2FA is already enabled'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Generate a random base32 secret key
        secret = pyotp.random_base32()
        request.user.two_factor_secret = secret
        request.user.save()

        print(f"[{now()}] Generated secret: {secret}")

        # Create a TOTP (Time-based One-Time Password) object
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            request.user.email,
            issuer_name="Transcendence"
        )

        # Create a QR code instance with specific settings
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)

        # Generate the QR code image
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        qr_code = base64.b64encode(buffer.getvalue()).decode()

        print(f"[{now()}] Successfully generated QR code for user {request.user.email}")

        return Response({
            'secret': secret,
            'qr_code': qr_code
        })
    except Exception as e:
        print(f"[{now()}] Error enabling 2FA: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': 'Failed to enable 2FA'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa(request):
    """Verify 2FA setup with initial code"""

    # Get the verification code from request data
    code = request.data.get('code')
    if not code:
        return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Create TOTP object with user's secret  
    totp = pyotp.TOTP(request.user.two_factor_secret)
    # Verify if the provided code is valid
    if totp.verify(code):
        # Enable 2FA for the user
        request.user.is_two_factor_enabled = True
        request.user.save()
        return Response({'success': True})
    
    return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_2fa(request):
    """Validate 2FA code during login"""

    # Get the validation code from request data
    code = request.data.get('code')
    if not code:
        return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if 2FA is enabled for the user
    if not request.user.is_two_factor_enabled:
        return Response({'error': '2FA is not enabled'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create TOTP object and verify code
    totp = pyotp.TOTP(request.user.two_factor_secret)
    if totp.verify(code):
        return Response({'success': True})
    
    return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    """Disable 2FA for user"""
    try:
        # Check if 2FA is enabled
        if not request.user.is_two_factor_enabled:
            return Response(
                {'error': '2FA is not enabled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Disable 2FA and clear the secret        
        request.user.is_two_factor_enabled = False
        request.user.two_factor_secret = ''
        request.user.save()

        return Response({
            'success': True,
            'message': '2FA disabled successfully'
        })
    except Exception as e:
        return Response(
            {'error': f'Failed to disable 2FA: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        data = request.data
        username = data.get('username')
        email = data.get('email')
        avatar = request.FILES.get('avatar')
        removeAvatar = data.get('removeAvatar')


        if not email and not username and not avatar and removeAvatar == 'no':
            return Response({'error': 'Please change at least one.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if avatar:
            user.avatar = avatar
        if removeAvatar == 'yes':
            user.avatar = '/avatars/profile.jpg'
        if email:
            try:
                validate_email(email)
                if User.objects.exclude(pk=user.pk).filter(email=email).exists():
                    return Response({
                        'error': 'This email is already in use by another account.',
                        'field': 'email'
                    }, status=status.HTTP_400_BAD_REQUEST)
                user.email = email
            except ValidationError:
                return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)

        if username:
            if User.objects.exclude(pk=user.pk).filter(profile__display_name=username).exists():
                return Response({
                    'error': 'Username is already in use by another account.',
                    'field': 'username'
                }, status=status.HTTP_400_BAD_REQUEST)
            if len(username) < 3:
                return Response(
                    {'error': 'Username must be at least 3 characters long.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if len(username) > 8:
                return Response(
                    {'error': 'Username must be no more than 8 characters long.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not username.isalnum():
                return Response({'error': 'Username must be alphanumeric.'}, status=status.HTTP_400_BAD_REQUEST)
            user.profile.display_name = username

        try:
            user.save()
            return Response('Profile updated successfully', status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        data = request.data
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        confirm_password = data.get('confimPassword')

        if not current_password and not new_password and not confirm_password:
            return Response({'error': 'Cannot all be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({'error': 'New password and confirmation do not match.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'error': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)