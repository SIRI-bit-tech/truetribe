from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListCreateView.as_view(), name='conversations'),
    path('conversations/<uuid:conversation_id>/messages/', views.MessageListCreateView.as_view(), name='messages'),
]