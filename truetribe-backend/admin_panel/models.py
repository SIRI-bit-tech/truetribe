from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class AdminAction(models.Model):
    ACTION_TYPES = [
        ('user_ban', 'User Ban'),
        ('user_unban', 'User Unban'),
        ('post_remove', 'Post Remove'),
        ('verification_approve', 'Verification Approve'),
        ('verification_reject', 'Verification Reject'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actions')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)