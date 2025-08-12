from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Comment, PostLike, CommentLike
from users.serializers import UserSerializer

User = get_user_model()

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'author', 'content', 'likes_count', 'created_at', 
            'updated_at', 'is_liked', 'replies_count', 'parent'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'likes_count']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CommentLike.objects.filter(user=request.user, comment=obj).exists()
        return False
    
    def get_replies_count(self, obj):
        return obj.replies.count()

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_shared = serializers.SerializerMethodField()
    recent_comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'author', 'content', 'image', 'likes_count', 'comments_count',
            'shares_count', 'is_pinned', 'created_at', 'updated_at',
            'is_liked', 'is_shared', 'recent_comments'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'likes_count', 
            'comments_count', 'shares_count'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.shares.filter(user=request.user).exists()
        return False
    
    def get_recent_comments(self, obj):
        recent_comments = obj.comments.filter(parent=None)[:3]
        return CommentSerializer(recent_comments, many=True, context=self.context).data

class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'image']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)