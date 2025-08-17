from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

# class User(AbstractUser):
#     """Extended user model with common auth fields"""
#     is_customer = models.BooleanField(default=False)
#     auth_provider = models.CharField(max_length=20, default='email')

class User(AbstractUser):
    """Extended user model with common auth fields"""
    is_customer = models.BooleanField(default=False)
    auth_provider = models.CharField(max_length=20, default='email')
    
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="custom_user_groups",
        related_query_name="custom_user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_permissions",
        related_query_name="custom_user",
    )
    
    class Meta:
        db_table = 'custom_user'
    

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    class Meta:
        verbose_name = "Customer Profile"
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"
    