from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('auth/',include("accounts.api_urls")) , 
    path('properties/',include("properties.api_urls"))
]