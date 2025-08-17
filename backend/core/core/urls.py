
from django.contrib import admin
from django.urls import path, include

# Swagger/ReDoc - API Documentation
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Savannah Informatics Interview",
        default_version='v1',
        description="Interview API",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('user/', include('myuser.urls')),
    path('products/', include('products.urls')),


    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc'),
    
]
