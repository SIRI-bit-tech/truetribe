from django.urls import path
from . import views

urlpatterns = [
    path('', views.PostCreateView.as_view(), name='post-create'),
    path('feed/', views.PostListView.as_view(), name='post-feed'),
    path('stories/', views.StoriesView.as_view(), name='stories'),
    path('stories/<uuid:story_id>/view/', views.view_story, name='view-story'),
    path('<uuid:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('<uuid:post_id>/like/', views.like_post, name='like-post'),
    path('<uuid:post_id>/bookmark/', views.bookmark_post, name='bookmark-post'),
    path('<uuid:post_id>/comments/', views.CommentListCreateView.as_view(), name='post-comments'),
]