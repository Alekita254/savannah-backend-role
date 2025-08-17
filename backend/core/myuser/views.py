    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from .serializers import CustomerProfileSerializer, RegisterSerializer, LoginSerializer, UserSerializer
from .utils import *
import logging

logger = logging.getLogger(__name__)


class LoginWithGoogle(APIView):
    def post(self, request):
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

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
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

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
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
    Handles both retrieval and updates of customer profile information
    """
    def get(self, request):
        if not request.user.is_authenticated or not hasattr(request.user, 'customer'):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        serializer = CustomerProfileSerializer(request.user.customer)
        return Response(serializer.data)

    def put(self, request):
        if not request.user.is_authenticated or not hasattr(request.user, 'customer'):
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        customer = request.user.customer
        serializer = CustomerProfileSerializer(
            customer,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)