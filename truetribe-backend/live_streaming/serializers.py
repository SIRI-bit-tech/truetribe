from rest_framework import serializers
from .models import LiveStream
from users.serializers import UserSerializer

class LiveStreamSerializer(serializers.ModelSerializer):
    streamer = UserSerializer(read_only=True)
    
    class Meta:
        model = LiveStream
        fields = ['id', 'streamer', 'title', 'description', 'is_live', 'viewers_count', 'started_at', 'ended_at']
        read_only_fields = ['id', 'is_live', 'viewers_count', 'started_at', 'ended_at']