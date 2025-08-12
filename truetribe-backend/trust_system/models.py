from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

User = get_user_model()

class TrustScore(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trust_score_detail')
    base_score = models.FloatField(default=50.0, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    verification_bonus = models.FloatField(default=0.0)
    activity_score = models.FloatField(default=0.0)
    community_score = models.FloatField(default=0.0)
    penalty_score = models.FloatField(default=0.0)
    final_score = models.FloatField(default=50.0, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    last_calculated = models.DateTimeField(auto_now=True)
    
    def calculate_final_score(self):
        self.final_score = max(0, min(100, 
            self.base_score + self.verification_bonus + 
            self.activity_score + self.community_score - self.penalty_score
        ))
        self.save()
        
        # Update user's trust_score field
        self.user.trust_score = self.final_score
        self.user.save()

class TrustAction(models.Model):
    ACTION_TYPES = [
        ('post_like', 'Post Like'),
        ('post_share', 'Post Share'),
        ('comment', 'Comment'),
        ('follow', 'Follow'),
        ('verification', 'Verification'),
        ('report_resolved', 'Report Resolved'),
        ('report_false', 'False Report'),
        ('spam_detected', 'Spam Detected'),
        ('scam_detected', 'Scam Detected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trust_actions')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    score_change = models.FloatField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class UserReport(models.Model):
    REPORT_TYPES = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('fake_profile', 'Fake Profile'),
        ('inappropriate', 'Inappropriate Content'),
        ('scam', 'Scam'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received')
    report_type = models.CharField(max_length=25, choices=REPORT_TYPES)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_reviewed')
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class TrustBadge(models.Model):
    BADGE_TYPES = [
        ('verified_email', 'Verified Email'),
        ('verified_phone', 'Verified Phone'),
        ('verified_id', 'Verified ID'),
        ('trusted_member', 'Trusted Member'),
        ('community_leader', 'Community Leader'),
        ('content_creator', 'Content Creator'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trust_badges')
    badge_type = models.CharField(max_length=20, choices=BADGE_TYPES)
    earned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('user', 'badge_type')