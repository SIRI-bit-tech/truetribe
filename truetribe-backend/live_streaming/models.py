from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class LiveStream(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    streamer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='live_streams')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_live = models.BooleanField(default=False)
    viewers_count = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)