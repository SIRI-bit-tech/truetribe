from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class UserAccount(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')
    registration_date = models.DateTimeField(auto_now_add=True)
    last_login_date = models.DateTimeField(null=True, blank=True)
    account_status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('banned', 'Banned'),
        ('pending', 'Pending Verification')
    ], default='active')
    registration_ip = models.GenericIPAddressField(null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    notes = models.TextField(blank=True, help_text="Admin notes about this user")
    
    class Meta:
        verbose_name = "User Account"
        verbose_name_plural = "User Accounts"
    
    def __str__(self):
        return f"{self.user.username} - {self.user.email}"