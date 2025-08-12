from django.contrib import admin
from .models import ScamReport

@admin.register(ScamReport)
class ScamReportAdmin(admin.ModelAdmin):
    list_display = ['reporter', 'reported_user', 'scam_type', 'is_verified', 'created_at']
    list_filter = ['scam_type', 'is_verified', 'created_at']
    search_fields = ['reporter__username', 'reported_user__username', 'description']
    
    actions = ['verify_scam_reports', 'dismiss_scam_reports']
    
    def verify_scam_reports(self, request, queryset):
        from trust_system.models import TrustScore, TrustAction
        
        for report in queryset:
            report.is_verified = True
            report.save()
            
            # Penalize reported user's trust score
            trust_score, created = TrustScore.objects.get_or_create(user=report.reported_user)
            trust_score.penalty_score += 15.0
            trust_score.calculate_final_score()
            
            # Record trust action
            TrustAction.objects.create(
                user=report.reported_user,
                action_type='scam_detected',
                score_change=-15.0,
                description=f"Verified scam report: {report.scam_type}"
            )
        
        self.message_user(request, f"Verified {queryset.count()} scam reports and updated trust scores")
    
    def dismiss_scam_reports(self, request, queryset):
        queryset.update(is_verified=False)
        self.message_user(request, f"Dismissed {queryset.count()} scam reports")