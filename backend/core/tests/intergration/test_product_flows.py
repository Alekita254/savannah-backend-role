import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from products.models import Product, Category, Cart, CartItem, Order, OrderItem
from myuser.models import User, Customer


@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client

@pytest.mark.django_db
class TestProductIntegration:
    def test_product_creation_flow(self, authenticated_client, test_user):
        # Create a category
        category_data = {'name': 'Electronics', 'parent': None}
        category_response = authenticated_client.post(
            reverse('category-list'),
            data=category_data,
            format='json'
        )
        assert category_response.status_code == status.HTTP_201_CREATED
        category_id = category_response.data['id']

        # Create a product with the category
        product_data = {
            'name': 'Smartphone',
            'description': 'Latest smartphone',
            'price': '599.99',
            'stock': 10,
            'categories': [category_id]
        }
        product_response = authenticated_client.post(
            reverse('product-list'),
            data=product_data,
            format='json'
        )
        
        # Debug output
        print("Product response data:", product_response.data)
        print("Product response status:", product_response.status_code)
        
        assert product_response.status_code == status.HTTP_201_CREATED
        product_id = product_response.data['id']

        # Verify product was created with the category
        product = Product.objects.get(id=product_id)
        print("Product categories:", list(product.categories.all()))
        
        assert product.name == 'Smartphone'
        product.refresh_from_db()
        assert product.categories.count() == 1
        assert product.categories.first().id == category_id

@pytest.mark.django_db
class TestOrderIntegration:
    def test_order_creation_flow(self, test_user, test_customer, test_product):
        # Create a cart for the customer
        cart = Cart.objects.create(customer=test_customer)
        
        # Add product to cart
        CartItem.objects.create(cart=cart, product=test_product, quantity=2)
        
        # Verify cart total
        assert cart.total == test_product.price * 2
        
        # Create an order from the cart
        order = Order.objects.create(
            customer=test_customer,
            shipping_address='123 Test Street',
            total=cart.total
        )
        
        # Create order items from cart items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
        
        # Verify order was created correctly
        assert order.items.count() == 1
        order_item = order.items.first()
        assert order_item.product == test_product
        assert order_item.quantity == 2
        assert order.total == test_product.price * 2
        
        # Verify product stock was not reduced yet (would happen in a real flow)
        assert test_product.stock == 10

@pytest.mark.django_db
class TestUserProductIntegration:
    def test_user_product_interaction(self, test_user, test_customer, test_product):
        # User adds product to cart
        cart, created = Cart.objects.get_or_create(customer=test_customer)
        cart_item = CartItem.objects.create(cart=cart, product=test_product, quantity=1)
        
        # Verify cart
        assert cart.items.count() == 1
        assert cart.total == test_product.price
        
        # User creates order
        order = Order.objects.create(
            customer=test_customer,
            shipping_address=test_customer.address,
            total=cart.total
        )
        OrderItem.objects.create(
            order=order,
            product=test_product,
            quantity=cart_item.quantity,
            price=test_product.price
        )
        
        # Verify order
        assert order.customer == test_customer
        assert order.status == 'P'
        assert order.items.count() == 1

