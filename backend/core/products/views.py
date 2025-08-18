from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *
from myuser.models import Customer
from .notifications import send_order_notifications
import africastalking
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CategoryList(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetail(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_object(self, pk):
        return get_object_or_404(Category, pk=pk)
    
    def get(self, request, pk):
        category = self.get_object(pk)
        serializer = CategorySerializer(category)
        return Response(serializer.data)
    
    def put(self, request, pk):
        category = self.get_object(pk)
        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        category = self.get_object(pk)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProductList(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        queryset = Product.objects.filter(available=True)
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(categories__id=category)
        serializer = ProductSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetail(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_object(self, pk):
        return get_object_or_404(Product, pk=pk)
    
    def get(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        product = self.get_object(pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class OrderList(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(customer__user=user)
    
    def get(self, request):
        orders = self.get_queryset()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            # Handle order items
            items_data = request.data.get('items', [])
            order = serializer.save()
            total = 0
            
            for item_data in items_data:
                product = get_object_or_404(Product, pk=item_data['product'])
                quantity = item_data['quantity']
                price = product.price * quantity
                total += price
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price
                )
            
            order.total = total
            order.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class OrderDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(customer__user=user)
    
    def get_object(self, pk):
        queryset = self.get_queryset()
        return get_object_or_404(queryset, pk=pk)
    
    def get(self, request, pk):
        try:
            order = self.get_object(pk)
            logger.info(
                f"Order #{order.id} accessed by {request.user.username}",
                extra={
                    'order_id': order.id,
                    'user': request.user.username,
                    'customer': order.customer.user.username
                }
            )
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Exception as e:
            logger.error(
                f"Failed to access order #{pk}",
                exc_info=True,
                extra={
                    'order_id': pk,
                    'user': request.user.username,
                    'error': str(e)
                }
            )
            return Response(
                {"error": "Failed to retrieve order"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, pk):
        order = self.get_object(pk)
        old_status = order.status
        
        try:
            serializer = OrderSerializer(order, data=request.data)
            
            if serializer.is_valid():
                serializer.save()
                new_status = serializer.data['status']
                
                # Log status change
                if old_status != new_status:
                    logger.info(
                        f"Order #{order.id} status changed",
                        extra={
                            'order_id': order.id,
                            'old_status': old_status,
                            'new_status': new_status,
                            'changed_by': request.user.username,
                            'customer': order.customer.user.username
                        }
                    )
                    
                    # Send notifications if status changed to shipped/delivered
                    if new_status in ['S', 'D']:
                        send_order_notifications(order)
                        logger.info(
                            f"Notifications sent for order #{order.id} status change",
                            extra={
                                'order_id': order.id,
                                'status': new_status,
                                'notification_types': ['email', 'sms']
                            }
                        )
                
                return Response(serializer.data)
            
            # Log validation errors
            logger.warning(
                f"Order #{order.id} update validation failed",
                extra={
                    'order_id': order.id,
                    'user': request.user.username,
                    'errors': serializer.errors
                }
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(
                f"Failed to update order #{order.id}",
                exc_info=True,
                extra={
                    'order_id': order.id,
                    'user': request.user.username,
                    'error': str(e)
                }
            )
            return Response(
                {"error": "Failed to update order"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, pk):
        order = self.get_object(pk)
        try:
            logger.warning(
                f"Order #{order.id} deletion initiated",
                extra={
                    'order_id': order.id,
                    'deleted_by': request.user.username,
                    'customer': order.customer.user.username,
                    'order_total': order.total,
                    'order_status': order.status
                }
            )
            order.delete()
            logger.warning(
                f"Order #{order.id} successfully deleted",
                extra={
                    'order_id': order.id,
                    'deleted_by': request.user.username
                }
            )
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(
                f"Failed to delete order #{order.id}",
                exc_info=True,
                extra={
                    'order_id': order.id,
                    'user': request.user.username,
                    'error': str(e)
                }
            )
            return Response(
                {"error": "Failed to delete order"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_cart(self, user):
        customer = Customer.objects.get(user=user)
        cart, created = Cart.objects.get_or_create(customer=customer)
        return cart
    
    def get(self, request):
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        product = get_object_or_404(Product, id=product_id, available=True)
        customer = Customer.objects.get(user=request.user)
        cart, _ = Cart.objects.get_or_create(customer=customer)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RemoveFromCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        product_id = request.data.get('product_id')
        customer = Customer.objects.get(user=request.user)
        cart = get_object_or_404(Cart, customer=customer)
        
        cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
        cart_item.delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class UpdateCartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        if int(quantity) < 1:
            return Response(
                {"error": "Quantity must be at least 1"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        customer = Customer.objects.get(user=request.user)
        cart = get_object_or_404(Cart, customer=customer)
        cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
        
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        customer = Customer.objects.get(user=request.user)
        cart = get_object_or_404(Cart, customer=customer)
        
        if cart.items.count() == 0:
            logger.warning(
                f"Empty cart checkout attempted by {request.user.username}",
                extra={
                    'user': request.user.username,
                    'customer': customer.user.username,
                    'cart_id': cart.id
                }
            )
            return Response(
                {"error": "Your cart is empty"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Log cart contents before checkout
            logger.info(
                f"Starting checkout process for cart {cart.id}",
                extra={
                    'user': request.user.username,
                    'customer': customer.user.username,
                    'cart_items': [
                        {
                            'product': item.product.name,
                            'quantity': item.quantity,
                            'price': item.product.price
                        } 
                        for item in cart.items.all()
                    ],
                    'cart_total': cart.total
                }
            )
            
            # Create order from cart
            order = Order.objects.create(
                customer=customer,
                shipping_address=request.data.get('shipping_address', ''),
                status='P'
            )
            
            # Log order creation
            logger.info(
                f"Order #{order.id} created from cart {cart.id}",
                extra={
                    'order_id': order.id,
                    'customer': customer.user.username,
                    'initial_status': order.status,
                    'shipping_address': order.shipping_address
                }
            )
            
            # Transfer cart items to order items
            for cart_item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price * cart_item.quantity
                )
                logger.debug(
                    f"Order item added to order #{order.id}",
                    extra={
                        'order_id': order.id,
                        'product': cart_item.product.name,
                        'quantity': cart_item.quantity,
                        'price': cart_item.product.price
                    }
                )
            
            # Calculate total
            order.total = sum(item.price * item.quantity for item in order.items.all())
            order.save()
            
            # Log order total
            logger.info(
                f"Order #{order.id} total calculated",
                extra={
                    'order_id': order.id,
                    'total': order.total,
                    'item_count': order.items.count()
                }
            )
            
            # Clear the cart
            cart.items.all().delete()
            logger.info(
                f"Cart {cart.id} cleared after checkout",
                extra={
                    'cart_id': cart.id,
                    'customer': customer.user.username
                }
            )
            
            # Send notifications
            send_order_notifications(order)
            logger.info(
                f"Notifications sent for order #{order.id}",
                extra={
                    'order_id': order.id,
                    'customer': customer.user.username,
                    'notification_types': ['email', 'sms']
                }
            )
            
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(
                f"Checkout failed for user {request.user.username}",
                exc_info=True,
                extra={
                    'user': request.user.username,
                    'customer': customer.user.username,
                    'cart_id': cart.id,
                    'error': str(e)
                }
            )
            return Response(
                {"error": "Checkout process failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SMSTestView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Simple SMS test endpoint
        Returns:
        - Success: If SMS was sent successfully
        - Error: If there was any issue
        """
        try:
            # Initialize Africa's Talking
            africastalking.initialize(
                username=settings.AFRICASTALKING_USERNAME,
                api_key=settings.AFRICASTALKING_API_KEY
            )
            sms = africastalking.SMS
            
            # Test message details (hardcoded for testing)
            recipients = ["+254795133505"]  # Replace with your test number
            message = "This is a test SMS from your Django app"
            
            # Send SMS
            response = sms.send(message, recipients)
            
            return Response({
                'status': 'success',
                'message': 'Test SMS sent successfully',
                'details': response
            }, status=200)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Failed to send SMS',
                'error': str(e)
            }, status=400)
        