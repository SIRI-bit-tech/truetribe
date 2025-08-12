from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Follow, Block

class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_verified', 'trust_score', 'date_joined', 'is_active')
    list_filter = ('is_verified', 'is_private', 'date_joined', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('phone', 'bio', 'profile_picture', 'cover_photo', 'website', 'location', 'birth_date')
        }),
        ('Social Information', {
            'fields': ('is_verified', 'is_private', 'trust_score', 'followers_count', 'following_count', 'posts_count')
        }),
        ('Activity', {
            'fields': ('last_active',)
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'first_name', 'last_name')
        }),
    )
    
    actions = ['verify_users', 'ban_users', 'activate_users']
    
    def verify_users(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, f'Verified {queryset.count()} users')
    verify_users.short_description = "Verify selected users"
    
    def ban_users(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f'Banned {queryset.count()} users')
    ban_users.short_description = "Ban selected users"
    
    def activate_users(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f'Activated {queryset.count()} users')
    activate_users.short_description = "Activate selected users"

admin.site.register(User, UserAdmin)

@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ('follower', 'following', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('follower__username', 'following__username')

@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ('blocker', 'blocked', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('blocker__username', 'blocked__username')