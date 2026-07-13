from django.urls import path
from .api.views import PropertyListView, PropertyDetailView, PropertyPostAdsView
urlpatterns = [
    path('', PropertyListView.as_view(), name='property-list'),
    path('<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
    path('post-ads/',PropertyPostAdsView.as_view(),name='property-post-ads')
]