from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.CategoryList.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetail.as_view(), name='category-detail'),
    
    # Products
    path('products/', views.ProductList.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetail.as_view(), name='product-detail'),
    
    # Orders
    path('orders/', views.OrderList.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetail.as_view(), name='order-detail'),

     # Cart endpoints
    path('cart/', views.CartView.as_view(), name='cart-detail'),
    path('cart/add/', views.AddToCartView.as_view(), name='add-to-cart'),
    path('cart/remove/', views.RemoveFromCartView.as_view(), name='remove-from-cart'),
    path('cart/update/', views.UpdateCartItemView.as_view(), name='update-cart-item'),
    path('cart/checkout/', views.CheckoutView.as_view(), name='checkout'),

    path('sms-test/', views.SMSTestView.as_view(), name='sms-test'),

]
