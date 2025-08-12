from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Video, VideoComment, VideoLike
from users.serializers import UserSerializer

User = get_user_model()

class VideoCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoComment
        fields = [
            'id', 'author', 'content', 'likes_count', 'created_at',
            'updated_at', 'is_liked', 'replies_count', 'parent'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'likes_count']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_replies_count(self, obj):
        return obj.replies.count()

class VideoSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_shared = serializers.SerializerMethodField()
    recent_comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'author', 'title', 'description', 'video_file', 'thumbnail',
            'duration', 'views_count', 'likes_count', 'comments_count',
            'shares_count', 'is_public', 'created_at', 'updated_at',
            'is_liked', 'is_shared', 'recent_comments'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'views_count',
            'likes_count', 'comments_count', 'shares_count'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return VideoLike.objects.filter(user=request.user, video=obj).exists()
        return False
    
    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.shares.filter(user=request.user).exists()
        return False
    
    def get_recent_comments(self, obj):
        recent_comments = obj.comments.filter(parent=None)[:3]
        return VideoCommentSerializer(recent_comments, many=True, context=self.context).data

class VideoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['title', 'description', 'video_file', 'thumbnail', 'is_public']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)