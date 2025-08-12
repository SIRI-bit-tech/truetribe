from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class VerificationRequest(models.Model):
    VERIFICATION_TYPES = [
        ('email', 'Email Verification'),
        ('phone', 'Phone Verification'),
        ('identity', 'Identity Verification'),
        ('business', 'Business Verification'),
        ('celebrity', 'Celebrity Verification'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_review', 'In Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_requests')
    verification_type = models.CharField(max_length=20, choices=VERIFICATION_TYPES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    submitted_data = models.JSONField(default=dict)
    documents = models.JSONField(default=list)  # Store file paths
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_verifications')
    review_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)

class VerificationDocument(models.Model):
    DOCUMENT_TYPES = [
        ('id_front', 'ID Front'),
        ('id_back', 'ID Back'),
        ('passport', 'Passport'),
        ('selfie', 'Selfie'),
        ('business_license', 'Business License'),
        ('utility_bill', 'Utility Bill'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    verification_request = models.ForeignKey(VerificationRequest, on_delete=models.CASCADE, related_name='uploaded_documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='verification_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class EmailVerification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification_email_verification')
    email = models.EmailField()
    token = models.CharField(max_length=100, unique=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

class PhoneVerification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20)
    verification_code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()

class VerificationBadge(models.Model):
    BADGE_TYPES = [
        ('email_verified', 'Email Verified'),
        ('phone_verified', 'Phone Verified'),
        ('identity_verified', 'Identity Verified'),
        ('business_verified', 'Business Verified'),
        ('celebrity_verified', 'Celebrity Verified'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_badges')
    badge_type = models.CharField(max_length=20, choices=BADGE_TYPES)
    verification_request = models.ForeignKey(VerificationRequest, on_delete=models.CASCADE, null=True, blank=True)
    awarded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('user', 'badge_type')