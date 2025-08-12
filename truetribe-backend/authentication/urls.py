from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('refresh/', views.refresh_token, name='refresh'),
    path('verify-email/', views.verify_email_token, name='verify-email'),
    path('reset-password/', views.reset_password, name='reset-password'),
]