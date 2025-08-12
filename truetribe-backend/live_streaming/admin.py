from django.contrib import admin
from django.utils import timezone
from .models import LiveStream

@admin.register(LiveStream)
class LiveStreamAdmin(admin.ModelAdmin):
    list_display = ['streamer', 'title', 'is_live', 'viewers_count', 'started_at', 'ended_at']
    list_filter = ['is_live', 'started_at']
    search_fields = ['streamer__username', 'title', 'description']
    readonly_fields = ['started_at', 'ended_at', 'viewers_count']
    
    actions = ['end_live_streams', 'start_live_streams']
    
    def end_live_streams(self, request, queryset):
        queryset.filter(is_live=True).update(
            is_live=False,
            ended_at=timezone.now()
        )
        self.message_user(request, f"Ended {queryset.count()} live streams")
    
    def start_live_streams(self, request, queryset):
        queryset.filter(is_live=False, ended_at__isnull=True).update(is_live=True)
        self.message_user(request, f"Started {queryset.count()} live streams")