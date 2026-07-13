from django.urls import path
from .api.views import PropertyListView
urlpatterns = [
    path('', PropertyListView.as_view(), name='property-list'),
]