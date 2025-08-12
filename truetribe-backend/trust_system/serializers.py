from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TrustScore, TrustAction, UserReport, TrustBadge
from users.serializers import UserSerializer

User = get_user_model()

class TrustScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustScore
        fields = [
            'base_score', 'verification_bonus', 'activity_score',
            'community_score', 'penalty_score', 'final_score', 'last_calculated'
        ]
        read_only_fields = ['final_score', 'last_calculated']

class TrustActionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TrustAction
        fields = ['id', 'user', 'action_type', 'score_change', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserReportSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    reported_user = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = UserReport
        fields = [
            'id', 'reporter', 'reported_user', 'report_type', 'description',
            'status', 'reviewed_by', 'resolution_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'created_at', 'updated_at']

class UserReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReport
        fields = ['reported_user', 'report_type', 'description']

class TrustBadgeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TrustBadge
        fields = ['id', 'user', 'badge_type', 'earned_at', 'is_active']
        read_only_fields = ['id', 'earned_at']