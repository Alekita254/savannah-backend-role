from rest_framework import serializers
from .models import Category, Product, Order, OrderItem
from myuser.models import Customer

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'parent', 'children')
    
    def get_children(self, obj):
        children = obj.get_children()
        serializer = CategorySerializer(children, many=True)
        return serializer.data
    
class SimpleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')

class ProductSerializer(serializers.ModelSerializer):
    categories = SimpleCategorySerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'categories', 
                 'stock', 'available', 'image', 'created_at', 'updated_at')
        
    def get_image(self, product):
        request = self.context.get('request')
        if product.image and hasattr (product.image, 'url'):
            image_url =  product.image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return None

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'quantity', 'price')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        default=serializers.CurrentUserDefault()
    )
    
    class Meta:
        model = Order
        fields = ('id', 'customer', 'status', 'shipping_address', 
                 'total', 'created_at', 'updated_at', 'items')
        read_only_fields = ('total', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        items_data = self.context.get('items', [])
        order = Order.objects.create(**validated_data)
        total = 0
        
        for item_data in items_data:
            product = item_data['product']
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
        return order
    