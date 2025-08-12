from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Follow, Block

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.ReadOnlyField()
    following_count = serializers.ReadOnlyField()
    posts_count = serializers.ReadOnlyField()
    is_following = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'bio',
            'profile_picture', 'cover_photo', 'website', 'location', 'birth_date',
            'is_verified', 'is_private', 'trust_score', 'followers_count',
            'following_count', 'posts_count', 'created_at', 'last_active',
            'is_following', 'is_blocked'
        ]
        read_only_fields = ['id', 'created_at', 'trust_score', 'is_verified']
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False
    
    def get_is_blocked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Block.objects.filter(blocker=request.user, blocked=obj).exists()
        return False

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'bio',
            'profile_picture', 'website', 'location', 'birth_date', 'phone'
        ]

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']