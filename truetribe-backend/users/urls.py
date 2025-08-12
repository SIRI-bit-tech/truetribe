from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.UserSearchView.as_view(), name='user-search'),
    path('me/', views.UserProfileView.as_view(), name='user-me'),
    path('<str:user_id>/', views.UserDetailView.as_view(), name='user-detail'),
    path('<str:user_id>/follow/', views.follow_user, name='follow-user'),
    path('<str:user_id>/followers/', views.user_followers, name='user-followers'),
    path('<str:user_id>/following/', views.user_following, name='user-following'),
]