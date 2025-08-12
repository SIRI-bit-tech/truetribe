from django.urls import path
from . import views

urlpatterns = [
    path('streams/', views.LiveStreamListCreateView.as_view(), name='live-streams'),
    path('streams/<uuid:stream_id>/end/', views.end_stream, name='end-stream'),
    path('streams/<uuid:stream_id>/join/', views.join_stream, name='join-stream'),
]