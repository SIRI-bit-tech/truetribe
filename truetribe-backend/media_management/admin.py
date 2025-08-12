from django.contrib import admin
from .models import MediaFile

@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ['user', 'media_type', 'file_size', 'uploaded_at']
    list_filter = ['media_type', 'uploaded_at']
    search_fields = ['user__username']
    readonly_fields = ['file_size', 'uploaded_at']
    
    def get_file_size_display(self, obj):
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    get_file_size_display.short_description = 'File Size'