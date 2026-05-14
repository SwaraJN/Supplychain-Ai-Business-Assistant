"""
URL Configuration for supply_chain_project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('supply_chain.urls')),
]
