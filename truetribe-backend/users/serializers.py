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
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'bio',
            'profile_picture', 'avatar', 'cover_photo', 'website', 'location', 'birth_date',
            'is_verified', 'is_private', 'trust_score', 'followers_count',
            'following_count', 'posts_count', 'created_at', 'last_active',
            'is_following', 'is_blocked'
        ]
        read_only_fields = ['id', 'created_at', 'trust_score', 'is_verified']
    
    def get_avatar(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None
    
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
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'bio',
            'profile_picture', 'avatar', 'website', 'location', 'birth_date', 'phone'
        ]
        read_only_fields = ['id']
    
    def get_avatar(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None
    
    def validate_profile_picture(self, value):
        if value:
            # Check file size (10MB limit)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Profile picture must be less than 10MB")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPG, PNG, and GIF files are allowed")
        
        return value
    
    def update(self, instance, validated_data):
        # Handle profile picture update
        if 'profile_picture' in validated_data:
            # Delete old profile picture if it exists
            if instance.profile_picture:
                try:
                    instance.profile_picture.delete(save=False)
                except Exception as e:
                    print(f"Error deleting old profile picture: {e}")
        
        return super().update(instance, validated_data)

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']