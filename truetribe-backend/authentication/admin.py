from django.contrib import admin
from .models import EmailVerification, PasswordReset

@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'is_verified', 'created_at']
    list_filter = ['is_verified', 'created_at']

@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'is_used', 'created_at']
    list_filter = ['is_used', 'created_at']