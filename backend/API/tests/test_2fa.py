# API/tests/test_2fa.py
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from API.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import pyotp
import json

class TwoFactorAuthenticationTest(TestCase):
    def setUp(self):
        """Set up test client and create test user"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_2fa(self):
        """Test the complete 2FA flow"""
        # 1. Enable 2FA
        response = self.client.post('/api/2fa/enable/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = json.loads(response.content)
        self.assertIn('secret', response_data)
        self.assertIn('qr_code', response_data)
        
        secret = response_data['secret']
        
        # 2. Verify 2FA setup
        totp = pyotp.TOTP(secret)
        valid_code = totp.now()
        
        response = self.client.post('/api/2fa/verify/', 
            {'code': valid_code}, 
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh user from db
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_two_factor_enabled)
        
        # 3. Validate 2FA during login
        response = self.client.post('/api/2fa/validate/', 
            {'code': totp.now()}, 
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Test invalid code
        response = self.client.post('/api/2fa/validate/', 
            {'code': '000000'}, 
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 5. Disable 2FA
        response = self.client.post('/api/2fa/disable/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify 2FA is disabled
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_two_factor_enabled)