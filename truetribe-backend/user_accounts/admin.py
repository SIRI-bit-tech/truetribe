from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import UserAccount

User = get_user_model()

@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ['user_username', 'user_email', 'user_first_name', 'user_last_name', 'account_status', 'email_verified', 'registration_date']
    list_filter = ['account_status', 'email_verified', 'phone_verified', 'registration_date']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    ordering = ['-registration_date']
    readonly_fields = ['registration_date', 'registration_ip']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Account Status', {
            'fields': ('account_status', 'email_verified', 'phone_verified')
        }),
        ('Registration Details', {
            'fields': ('registration_date', 'last_login_date', 'registration_ip')
        }),
        ('Admin Notes', {
            'fields': ('notes',)
        }),
    )
    
    actions = ['activate_accounts', 'suspend_accounts', 'ban_accounts', 'verify_emails']
    
    def user_username(self, obj):
        return obj.user.username
    user_username.short_description = 'Username'
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    
    def user_first_name(self, obj):
        return obj.user.first_name
    user_first_name.short_description = 'First Name'
    
    def user_last_name(self, obj):
        return obj.user.last_name
    user_last_name.short_description = 'Last Name'
    
    def activate_accounts(self, request, queryset):
        queryset.update(account_status='active')
        for account in queryset:
            account.user.is_active = True
            account.user.save()
        self.message_user(request, f'Activated {queryset.count()} accounts')
    activate_accounts.short_description = "Activate selected accounts"
    
    def suspend_accounts(self, request, queryset):
        queryset.update(account_status='suspended')
        for account in queryset:
            account.user.is_active = False
            account.user.save()
        self.message_user(request, f'Suspended {queryset.count()} accounts')
    suspend_accounts.short_description = "Suspend selected accounts"
    
    def ban_accounts(self, request, queryset):
        queryset.update(account_status='banned')
        for account in queryset:
            account.user.is_active = False
            account.user.save()
        self.message_user(request, f'Banned {queryset.count()} accounts')
    ban_accounts.short_description = "Ban selected accounts"
    
    def verify_emails(self, request, queryset):
        queryset.update(email_verified=True)
        for account in queryset:
            account.user.is_verified = True
            account.user.save()
        self.message_user(request, f'Verified emails for {queryset.count()} accounts')
    verify_emails.short_description = "Verify emails for selected accounts"