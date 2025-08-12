from django.contrib import admin
from .models import TrustScore, TrustAction, UserReport, TrustBadge

@admin.register(TrustScore)
class TrustScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'final_score', 'base_score', 'verification_bonus', 'activity_score', 'community_score', 'penalty_score', 'last_calculated']
    list_filter = ['last_calculated']
    search_fields = ['user__username']
    readonly_fields = ['final_score', 'last_calculated']
    
    actions = ['recalculate_scores']
    
    def recalculate_scores(self, request, queryset):
        for trust_score in queryset:
            trust_score.calculate_final_score()
        self.message_user(request, f"Recalculated {queryset.count()} trust scores")
    recalculate_scores.short_description = "Recalculate selected trust scores"

@admin.register(TrustAction)
class TrustActionAdmin(admin.ModelAdmin):
    list_display = ['user', 'action_type', 'score_change', 'description', 'created_at']
    list_filter = ['action_type', 'created_at']
    search_fields = ['user__username', 'description']

@admin.register(UserReport)
class UserReportAdmin(admin.ModelAdmin):
    list_display = ['reporter', 'reported_user', 'report_type', 'status', 'created_at']
    list_filter = ['report_type', 'status', 'created_at']
    search_fields = ['reporter__username', 'reported_user__username', 'description']
    
    actions = ['mark_resolved', 'mark_dismissed']
    
    def mark_resolved(self, request, queryset):
        queryset.update(status='resolved')
        self.message_user(request, f"Marked {queryset.count()} reports as resolved")
    
    def mark_dismissed(self, request, queryset):
        queryset.update(status='dismissed')
        self.message_user(request, f"Dismissed {queryset.count()} reports")

@admin.register(TrustBadge)
class TrustBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge_type', 'earned_at', 'is_active']
    list_filter = ['badge_type', 'is_active', 'earned_at']
    search_fields = ['user__username']