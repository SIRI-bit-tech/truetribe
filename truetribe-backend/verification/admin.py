from django.contrib import admin
from django.utils import timezone
from .models import VerificationRequest, VerificationDocument, EmailVerification, PhoneVerification, VerificationBadge

@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'verification_type', 'status', 'reviewer', 'created_at', 'updated_at']
    list_filter = ['verification_type', 'status', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    actions = ['approve_requests', 'reject_requests']
    
    def approve_requests(self, request, queryset):
        from trust_system.models import TrustScore
        
        for verification_request in queryset.filter(status='pending'):
            verification_request.status = 'approved'
            verification_request.reviewer = request.user
            verification_request.review_notes = f"Approved by {request.user.username}"
            verification_request.save()
            
            # Award verification badge
            VerificationBadge.objects.get_or_create(
                user=verification_request.user,
                badge_type=f"{verification_request.verification_type}_verified",
                defaults={'verification_request': verification_request}
            )
            
            # Update trust score
            trust_score, created = TrustScore.objects.get_or_create(user=verification_request.user)
            trust_score.verification_bonus += 10.0
            trust_score.calculate_final_score()
            
            # Mark user as verified if identity verification
            if verification_request.verification_type == 'identity':
                verification_request.user.is_verified = True
                verification_request.user.save()
        
        self.message_user(request, f"Approved {queryset.count()} verification requests")
    
    def reject_requests(self, request, queryset):
        queryset.update(
            status='rejected',
            reviewer=request.user,
            review_notes=f"Rejected by {request.user.username}"
        )
        self.message_user(request, f"Rejected {queryset.count()} verification requests")

@admin.register(VerificationDocument)
class VerificationDocumentAdmin(admin.ModelAdmin):
    list_display = ['verification_request', 'document_type', 'uploaded_at']
    list_filter = ['document_type', 'uploaded_at']

@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'email', 'is_verified', 'created_at', 'verified_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['user__username', 'email']
    
    actions = ['mark_verified']
    
    def mark_verified(self, request, queryset):
        queryset.update(is_verified=True, verified_at=timezone.now())
        self.message_user(request, f"Marked {queryset.count()} emails as verified")

@admin.register(PhoneVerification)
class PhoneVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'is_verified', 'attempts', 'created_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['user__username', 'phone_number']

@admin.register(VerificationBadge)
class VerificationBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge_type', 'awarded_at', 'is_active']
    list_filter = ['badge_type', 'is_active', 'awarded_at']
    search_fields = ['user__username']