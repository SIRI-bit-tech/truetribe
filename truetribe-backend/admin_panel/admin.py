from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import AdminAction

User = get_user_model()

@admin.register(AdminAction)
class AdminActionAdmin(admin.ModelAdmin):
    list_display = ['admin', 'action_type', 'target_user', 'description', 'created_at']
    list_filter = ['action_type', 'created_at']
    search_fields = ['admin__username', 'target_user__username', 'description']
    readonly_fields = ['created_at']

# Custom admin actions for User model
class CustomUserAdmin(admin.ModelAdmin):
    actions = ['ban_users', 'unban_users', 'verify_users', 'unverify_users']
    
    def ban_users(self, request, queryset):
        for user in queryset:
            user.is_active = False
            user.save()
            
            AdminAction.objects.create(
                admin=request.user,
                action_type='user_ban',
                target_user=user,
                description=f"User {user.username} banned by {request.user.username}"
            )
        
        self.message_user(request, f"Banned {queryset.count()} users")
    
    def unban_users(self, request, queryset):
        for user in queryset:
            user.is_active = True
            user.save()
            
            AdminAction.objects.create(
                admin=request.user,
                action_type='user_unban',
                target_user=user,
                description=f"User {user.username} unbanned by {request.user.username}"
            )
        
        self.message_user(request, f"Unbanned {queryset.count()} users")
    
    def verify_users(self, request, queryset):
        from trust_system.models import TrustScore
        
        for user in queryset:
            user.is_verified = True
            user.save()
            
            # Boost trust score
            trust_score, created = TrustScore.objects.get_or_create(user=user)
            trust_score.verification_bonus += 15.0
            trust_score.calculate_final_score()
            
            AdminAction.objects.create(
                admin=request.user,
                action_type='verification_approve',
                target_user=user,
                description=f"User {user.username} verified by admin {request.user.username}"
            )
        
        self.message_user(request, f"Verified {queryset.count()} users and updated trust scores")
    
    def unverify_users(self, request, queryset):
        queryset.update(is_verified=False)
        self.message_user(request, f"Unverified {queryset.count()} users")

# Extend the existing User admin
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

# Admin actions are now handled in users.admin.py