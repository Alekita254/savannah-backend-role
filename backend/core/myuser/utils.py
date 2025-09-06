
import logging
from oauth2client import client
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)
User = get_user_model()

class GoogleOAuth:
    @staticmethod
    def get_user_data_from_code(code):
        """
        Get user data directly from authorization code using client_secret.json
        """
        try:
            credentials = client.credentials_from_clientsecrets_and_code(
                'client_secret.json',
                ['openid', 'email', 'profile'],
                code
            )
            
            # Extract user data from ID token
            id_token = credentials.id_token
            return {
                'email': id_token['email'],
                'first_name': id_token.get('given_name', ''),
                'last_name': id_token.get('family_name', ''),
                'is_verified': id_token.get('email_verified', False)
            }
            
        except Exception as e:
            logger.error(f"Google auth failed: {str(e)}")
            raise AuthenticationFailed(f'Google authentication failed: {str(e)}')

    @staticmethod
    def get_or_create_user(user_data):
        """
        Get or create user based on Google profile data
        """
        try:
            email = user_data['email']
            
            # Generate username from email
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
                
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'is_customer': True,
                    'auth_provider': 'google',
                    'is_active': True
                }
            )
            
            # Update user data if changed
            if not created:
                needs_update = False
                if user.first_name != user_data['first_name']:
                    user.first_name = user_data['first_name']
                    needs_update = True
                if user.last_name != user_data['last_name']:
                    user.last_name = user_data['last_name']
                    needs_update = True
                if needs_update:
                    user.save()
            
            return user
            
        except Exception as e:
            logger.error(f"User creation failed: {str(e)}")
            raise AuthenticationFailed(f'User creation failed: {str(e)}')  