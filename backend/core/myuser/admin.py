
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Customer

# Unregister the default User admin if it's registered
# admin.site.unregister(User)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 
                   'is_customer', 'auth_provider', 'is_staff', 'is_active')
    list_filter = ('is_customer', 'auth_provider', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    # Keep the original fieldsets and add custom fields
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 
                      'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Custom Fields', {'fields': ('is_customer', 'auth_provider')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2',
                      'first_name', 'last_name', 'is_customer', 'auth_provider'),
        }),
    )

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'city', 'country', 'get_email')
    search_fields = ('user__username', 'user__email', 'phone', 'city', 'country')
    list_select_related = ('user',)
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'
    
    # Customize the form to show user details
    fieldsets = (
        (None, {
            'fields': ('user',)
        }),
        ('Contact Information', {
            'fields': ('phone', 'address', 'city', 'country')
        }),
    )
    
    # To make the user field read-only when editing
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ('user',)
        return self.readonly_fields