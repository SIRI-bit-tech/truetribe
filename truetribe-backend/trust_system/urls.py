from django.urls import path
from . import views

urlpatterns = [
    path('score/me/', views.UserTrustScoreView.as_view(), name='user-trust-score'),
    path('score/<str:user_id>/', views.UserTrustScoreView.as_view(), name='user-trust-score-detail'),
    path('report-scam/', views.ReportScamView.as_view(), name='report-scam'),
    path('fact-check/<uuid:post_id>/', views.fact_check_post, name='fact-check'),
]