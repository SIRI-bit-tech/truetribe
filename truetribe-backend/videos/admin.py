from django.contrib import admin
from .models import Video, VideoLike, VideoComment, VideoView, VideoShare

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'views_count', 'likes_count', 'duration', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['title', 'description', 'author__username']
    readonly_fields = ['views_count', 'likes_count', 'comments_count', 'shares_count']

@admin.register(VideoComment)
class VideoCommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'video', 'content', 'likes_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username']

@admin.register(VideoView)
class VideoViewAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'watched_duration', 'ip_address', 'created_at']
    list_filter = ['created_at']

admin.site.register(VideoLike)
admin.site.register(VideoShare)