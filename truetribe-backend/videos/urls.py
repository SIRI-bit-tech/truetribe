from django.urls import path
from . import views

urlpatterns = [
    path('', views.VideoCreateView.as_view(), name='video-create'),
    path('feed/', views.VideoListView.as_view(), name='video-feed'),
    path('<uuid:pk>/', views.VideoDetailView.as_view(), name='video-detail'),
    path('<uuid:video_id>/like/', views.like_video, name='like-video'),
    path('<uuid:video_id>/comments/', views.VideoCommentListCreateView.as_view(), name='video-comments'),
]