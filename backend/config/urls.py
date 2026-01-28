from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include

def home(request):
    return JsonResponse({"message": "CoffeeKaafiHai Backend Running ☕"})

urlpatterns = [
    path('', home),                      # ROOT URL
    path('admin/', admin.site.urls),
    path('api/', include('apps.products.urls')),
]
