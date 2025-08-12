from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import VerificationRequest, VerificationDocument, EmailVerification, PhoneVerification, VerificationBadge
from users.serializers import UserSerializer

User = get_user_model()

class VerificationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDocument
        fields = ['id', 'document_type', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class VerificationRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    reviewer = UserSerializer(read_only=True)
    uploaded_documents = VerificationDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = VerificationRequest
        fields = [
            'id', 'user', 'verification_type', 'status', 'submitted_data',
            'documents', 'reviewer', 'review_notes', 'created_at',
            'updated_at', 'expires_at', 'uploaded_documents'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'reviewer']

class VerificationRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRequest
        fields = ['verification_type', 'submitted_data']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class EmailVerificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = EmailVerification
        fields = ['id', 'user', 'email', 'is_verified', 'created_at', 'verified_at']
        read_only_fields = ['id', 'user', 'created_at', 'verified_at']

class PhoneVerificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PhoneVerification
        fields = ['id', 'user', 'phone_number', 'is_verified', 'created_at', 'verified_at']
        read_only_fields = ['id', 'user', 'created_at', 'verified_at', 'verification_code', 'attempts']

class VerificationBadgeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = VerificationBadge
        fields = ['id', 'user', 'badge_type', 'awarded_at', 'is_active']
        read_only_fields = ['id', 'user', 'awarded_at']