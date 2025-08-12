from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class ScamReport(models.Model):
    SCAM_TYPES = [
        ('fake_profile', 'Fake Profile'),
        ('financial_scam', 'Financial Scam'),
        ('phishing', 'Phishing'),
        ('romance_scam', 'Romance Scam'),
        ('investment_scam', 'Investment Scam'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scam_reports')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scam_reports_received')
    scam_type = models.CharField(max_length=20, choices=SCAM_TYPES)
    description = models.TextField()
    evidence = models.JSONField(default=list)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)