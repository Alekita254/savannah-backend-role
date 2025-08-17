from django.urls import path
from rest_framework_simplejwt.views import (
    TokenVerifyView,
    TokenRefreshView,
)

from .views import (
    LoginWithGoogle,
    RegisterView,
    LoginView,
    CustomerProfileView,
)

urlpatterns = [
    # Google Auth
    path('login-with-google/', LoginWithGoogle.as_view(), name='login-with-google'),
    
    # Local Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    
    # Token Management
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', CustomerProfileView.as_view(), name='customer-profile'),
]