from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from .models import Category, Product, Order, OrderItem

@admin.register(Category)
class CategoryAdmin(MPTTModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'available')
    list_filter = ('available', 'categories')
    search_fields = ('name', 'description')
    filter_horizontal = ('categories',)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'status', 'total', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer__user__username', 'id')
    inlines = [OrderItemInline]