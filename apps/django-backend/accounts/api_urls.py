from django.urls import path
from accounts.api.views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    CustomLogoutView,
    SignupUser,
    UpdateProfileView,
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh_alt'),
    path('logout/', CustomLogoutView.as_view(), name='token_logout'),
    path('register/', SignupUser.as_view(), name='signup'),
    path('profile/', UpdateProfileView.as_view(), name='update_profile'),
]