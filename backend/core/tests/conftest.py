import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model

from products.models import Category, Product
from myuser.models import Customer

User = get_user_model()

@pytest.fixture
def sample_image():
    return SimpleUploadedFile(
        "test_image.jpg", 
        b"file_content", 
        content_type="image/jpeg"
    )

@pytest.fixture
def test_user():
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )
    return user

@pytest.fixture
def test_customer(test_user):
    customer = Customer.objects.create(
        user=test_user,
        phone='+254712345678',
        address='123 Test Street',
        city='Nairobi',
        country='Kenya'
    )
    return customer

@pytest.fixture
def root_category():
    return Category.objects.create(name='Root Category')

@pytest.fixture
def child_category(root_category):
    return Category.objects.create(name='Child Category', parent=root_category)

@pytest.fixture
def test_product(root_category, sample_image):
    product = Product.objects.create(
        name='Test Product',
        description='Test Description',
        price=100.00,
        stock=10,
        available=True,
        image=sample_image
    )
    product.categories.add(root_category)
    return product