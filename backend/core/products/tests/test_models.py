import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db.utils import IntegrityError
from mptt.exceptions import InvalidMove

from products.models import Category, Product, Order, OrderItem, Cart, CartItem
from myuser.models import User, Customer

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
        password='testpass123'
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

@pytest.mark.django_db
class TestCategoryModel:
    def test_create_category(self, root_category):
        assert root_category.name == 'Root Category'
        assert str(root_category) == 'Root Category'
        assert root_category.parent is None

    def test_create_child_category(self, root_category, child_category):
        assert child_category.parent == root_category
        assert root_category.children.count() == 1
        assert root_category.children.first() == child_category

    def test_category_str(self, root_category):
        assert str(root_category) == 'Root Category'

    def test_invalid_parent_assignment(self, child_category):
        # Trying to make a category its own parent
        with pytest.raises(InvalidMove):
            child_category.parent = child_category
            child_category.save()

@pytest.mark.django_db
class TestProductModel:
    def test_create_product(self, test_product, root_category):
        assert test_product.name == 'Test Product'
        assert test_product.price == 100.00
        assert test_product.categories.count() == 1
        assert test_product.categories.first() == root_category
        assert test_product.available is True
        assert test_product.image.name.startswith('products/')

    def test_product_str(self, test_product):
        assert str(test_product) == 'Test Product'

    def test_product_available_default(self):
        product = Product.objects.create(
            name='No Stock Product',
            description='Test',
            price=50.00
        )
        assert product.available is True

    def test_product_not_available_when_no_stock(self):
        product = Product.objects.create(
            name='No Stock Product',
            description='Test',
            price=50.00,
            stock=0,
            available=False
        )
        assert product.available is False

@pytest.mark.django_db
class TestOrderModels:
    def test_create_order(self, test_customer):
        order = Order.objects.create(
            customer=test_customer,
            shipping_address='123 Test Street',
            total=200.00
        )
        assert order.customer == test_customer
        assert order.status == 'P'
        assert str(order) == f"Order #{order.id} - {test_customer}"

    def test_order_status_choices(self, test_customer):
        order = Order.objects.create(
            customer=test_customer,
            shipping_address='123 Test Street',
            total=200.00,
            status='C'
        )
        assert order.get_status_display() == 'Confirmed'

    def test_create_order_item(self, test_customer, test_product):
        order = Order.objects.create(
            customer=test_customer,
            shipping_address='123 Test Street',
            total=200.00
        )
        order_item = OrderItem.objects.create(
            order=order,
            product=test_product,
            quantity=2,
            price=test_product.price
        )
        assert order_item.order == order
        assert order_item.product == test_product
        assert order_item.quantity == 2
        assert order_item.price == test_product.price
        assert str(order_item) == f"2 x {test_product.name} (Order #{order.id})"

@pytest.mark.django_db
class TestCartModels:
    def test_create_cart(self, test_customer):
        cart = Cart.objects.create(customer=test_customer)
        assert cart.customer == test_customer
        assert str(cart) == f"Cart of {test_customer.user.username}"

    def test_cart_total_property(self, test_customer, test_product):
        cart = Cart.objects.create(customer=test_customer)
        CartItem.objects.create(
            cart=cart,
            product=test_product,
            quantity=3
        )
        assert cart.total == test_product.price * 3

    def test_create_cart_item(self, test_customer, test_product):
        cart = Cart.objects.create(customer=test_customer)
        cart_item = CartItem.objects.create(
            cart=cart,
            product=test_product,
            quantity=1
        )
        assert cart_item.cart == cart
        assert cart_item.product == test_product
        assert cart_item.quantity == 1
        assert cart_item.subtotal == test_product.price
        assert str(cart_item) == f"1 x {test_product.name} in cart"

    def test_cart_item_unique_together(self, test_customer, test_product):
        cart = Cart.objects.create(customer=test_customer)
        CartItem.objects.create(
            cart=cart,
            product=test_product,
            quantity=1
        )
        # Try to add the same product again
        with pytest.raises(IntegrityError):
            CartItem.objects.create(
                cart=cart,
                product=test_product,
                quantity=2
            )