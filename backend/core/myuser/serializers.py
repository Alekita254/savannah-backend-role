from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import Customer

User = get_user_model()

class CustomerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = Customer
        fields = ['email', 'first_name', 'last_name', 'phone', 'address', 'city', 'country']
        extra_kwargs = {
            'phone': {'required': False},
            'address': {'required': False},
        }

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        return super().update(instance, validated_data)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name',
                 'phone', 'address', 'city', 'country')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Extract customer data
        customer_data = {
            'phone': validated_data.pop('phone', ''),
            'address': validated_data.pop('address', ''),
            'city': validated_data.pop('city', ''),
            'country': validated_data.pop('country', '')
        }
        
        # Create user
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['email'],
            is_customer=True,  # Mark as customer
            **validated_data
        )
        
        # Create customer profile
        Customer.objects.create(user=user, **customer_data)
        
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 
            'first_name', 'last_name',
            'is_customer', 'auth_provider'
        ]
        read_only_fields = fields