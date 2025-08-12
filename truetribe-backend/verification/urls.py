from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.SubmitVerificationView.as_view(), name='submit-verification'),
    path('status/', views.verification_status, name='verification-status'),
    path('expertise/', views.ExpertiseVerificationView.as_view(), name='expertise-verification'),
]