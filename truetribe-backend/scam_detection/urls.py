from django.urls import path
from . import views

urlpatterns = [
    path('report/', views.report_scam, name='report-scam'),
]