import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError

from myuser.models import User, Customer

User = get_user_model()

@pytest.fixture
def test_user():
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )

@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self, test_user):
        assert test_user.username == 'testuser'
        assert test_user.email == 'test@example.com'
        assert test_user.check_password('testpass123')
        assert test_user.is_customer is False
        assert test_user.auth_provider == 'email'
        assert test_user.get_full_name() == 'Test User'
        assert str(test_user) == 'testuser'

    def test_create_superuser(self):
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        assert admin_user.is_superuser is True
        assert admin_user.is_staff is True

    def test_user_groups_relation(self, test_user):
        from django.contrib.auth.models import Group
        group = Group.objects.create(name='Test Group')
        test_user.groups.add(group)
        assert test_user.groups.count() == 1
        assert test_user.groups.first() == group

    def test_user_permissions_relation(self, test_user):
        from django.contrib.auth.models import Permission
        permission = Permission.objects.create(
            codename='test_permission',
            name='Test Permission',
            content_type_id=1  # Assuming content type with id=1 exists
        )
        test_user.user_permissions.add(permission)
        assert test_user.user_permissions.count() == 1
        assert test_user.user_permissions.first() == permission

@pytest.mark.django_db
class TestCustomerModel:
    def test_create_customer(self, test_user):
        customer = Customer.objects.create(
            user=test_user,
            phone='+254712345678',
            address='123 Test Street',
            city='Nairobi',
            country='Kenya'
        )
        assert customer.user == test_user
        assert customer.phone == '+254712345678'
        assert customer.address == '123 Test Street'
        assert customer.city == 'Nairobi'
        assert customer.country == 'Kenya'
        assert str(customer) == 'Test User'

    def test_customer_str_no_name(self):
        user = User.objects.create_user(
            username='nonameuser',
            email='noname@example.com',
            password='testpass123'
        )
        customer = Customer.objects.create(user=user)
        assert str(customer) == 'nonameuser'

    def test_customer_user_one_to_one(self, test_user):
        Customer.objects.create(user=test_user)
        # Try to create another customer with same user
        with pytest.raises(IntegrityError):
            Customer.objects.create(user=test_user)

