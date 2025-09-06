"""
Views for user authentication and profile management.

This module provides API endpoints for:
- Google OAuth login
- User registration and login (JWT)
- Customer profile CRUD operations

Design:
- Uses Django REST Framework generic views and APIView.
- JWT authentication via SimpleJWT.
- Google OAuth handled via utility functions.
- Profile endpoints require authentication.
"""

from rest_framework.views import APIView
from rest_framework import generics, exceptions
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from .serializers import CustomerProfileSerializer, RegisterSerializer, LoginSerializer, UserSerializer
from .utils import *
import logging

logger = logging.getLogger(__name__)


class LoginWithGoogle(generics.ListCreateAPIView):
    """
    API endpoint for logging in with Google OAuth.

    Expects an authorization code from the frontend, exchanges it for user info,
    creates or retrieves the user, and returns JWT tokens.
    """
    def post(self, request):
        """
        Handle POST request for Google login.

        Request data:
            - code: Google OAuth authorization code

        Returns:
            - access_token, refresh_token, and user info on success
            - error message on failure
        """
        code = request.data.get('code')
        
        if not code:
            return Response(
                {'error': 'Authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get user data directly from code
            user_data = GoogleOAuth.get_user_data_from_code(code)
            
            # Create or get user
            user = GoogleOAuth.get_or_create_user(user_data)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            })
            
        except Exception as e:
            logger.error(f"Google login failed: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class RegisterView(generics.ListCreateAPIView):
    """
    API endpoint for user registration.

    Accepts user registration data, creates a new user, and returns JWT tokens.
    """
    serializer_class = RegisterSerializer

    def post(self, request):
        """
        Handle POST request for user registration.

        Request data:
            - email, password, first_name, last_name, etc.

        Returns:
            - JWT tokens and user info on success
            - validation errors on failure
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.ListCreateAPIView):
    """
    API endpoint for user login.

    Accepts user credentials, authenticates, and returns JWT tokens.
    """
    serializer_class = LoginSerializer

    def post(self, request):
        """
        Handle POST request for user login.

        Request data:
            - email/username and password

        Returns:
            - JWT tokens and user info on success
            - validation errors on failure
        """
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomerProfileView(APIView):
    """
    API endpoint for customer profile management.

    Supports:
    - GET: Retrieve profile
    - POST: Create profile
    - PUT: Full update
    - PATCH: Partial update

    Requires authentication.
    """
    def get(self, request):
        """
        Retrieve the authenticated user's profile.

        Returns:
            - Combined user and profile data
            - Error if not authenticated
        """
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Always return basic user data
        user_data = UserSerializer(request.user).data
        
        # Add profile data if exists
        if hasattr(request.user, 'customer'):
            profile_data = CustomerProfileSerializer(request.user.customer).data
            user_data.update(profile_data)
        
        return Response(user_data)

    def post(self, request):
        """
        Create a customer profile for the authenticated user.

        Returns:
            - Combined user and profile data on success
            - Error if profile exists or not authenticated
        """
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if profile already exists
        if hasattr(request.user, 'customer'):
            return Response(
                {'error': 'Customer profile already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CustomerProfileSerializer(data=request.data)
        if serializer.is_valid():
            # Create customer profile linked to the user
            serializer.save(user=request.user)
            
            # Return combined user and profile data
            user_data = UserSerializer(request.user).data
            user_data.update(serializer.data)
            return Response(user_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        """
        Fully update the authenticated user's customer profile.

        Returns:
            - Updated user and profile data on success
            - Error if profile not found or not authenticated
        """
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not hasattr(request.user, 'customer'):
            return Response(
                {'error': 'Customer profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        customer = request.user.customer
        serializer = CustomerProfileSerializer(
            customer,
            data=request.data
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Return combined user and profile data
            user_data = UserSerializer(request.user).data
            user_data.update(serializer.data)
            return Response(user_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """
        Partially update the authenticated user's customer profile.

        Returns:
            - Updated user and profile data on success
            - Error if profile not found or not authenticated
        """
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not hasattr(request.user, 'customer'):
            return Response(
                {'error': 'Customer profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        customer = request.user.customer
        serializer = CustomerProfileSerializer(
            customer,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Return combined user and profile data
            user_data = UserSerializer(request.user).data
            user_data.update(serializer.data)
            return Response(user_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)