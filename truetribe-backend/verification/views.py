from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random
import string
from .models import (
    VerificationRequest, VerificationDocument, EmailVerification,
    PhoneVerification, VerificationBadge
)
from .serializers import (
    VerificationRequestSerializer, VerificationRequestCreateSerializer,
    VerificationDocumentSerializer, EmailVerificationSerializer,
    PhoneVerificationSerializer, VerificationBadgeSerializer
)

User = get_user_model()

class SubmitVerificationView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Verification submission logic
        return Response({'message': 'Verification submitted successfully'})

class ExpertiseVerificationView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Expertise verification logic
        return Response({'message': 'Expertise verification submitted'})



@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_verification_document(request, request_id):
    verification_request = get_object_or_404(
        VerificationRequest,
        id=request_id,
        user=request.user
    )
    
    if verification_request.status != 'pending':
        return Response(
            {'error': 'Cannot upload documents for non-pending requests'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    document_type = request.data.get('document_type')
    file = request.FILES.get('file')
    
    if not document_type or not file:
        return Response(
            {'error': 'Document type and file are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    document = VerificationDocument.objects.create(
        verification_request=verification_request,
        document_type=document_type,
        file=file
    )
    
    serializer = VerificationDocumentSerializer(document)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_email_verification(request):
    user = request.user
    email = request.data.get('email', user.email)
    
    # Generate verification token
    token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    
    email_verification, created = EmailVerification.objects.get_or_create(
        user=user,
        defaults={
            'email': email,
            'token': token
        }
    )
    
    if not created:
        email_verification.token = token
        email_verification.is_verified = False
        email_verification.save()
    
    # TODO: Send actual email
    # For now, return the token for testing
    return Response({
        'message': 'Verification email sent',
        'token': token  # Remove this in production
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_email(request):
    token = request.data.get('token')
    
    if not token:
        return Response({'error': 'Token required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        email_verification = EmailVerification.objects.get(
            user=request.user,
            token=token,
            is_verified=False
        )
        
        email_verification.is_verified = True
        email_verification.verified_at = timezone.now()
        email_verification.save()
        
        # Award verification badge
        VerificationBadge.objects.get_or_create(
            user=request.user,
            badge_type='email_verified'
        )
        
        return Response({'message': 'Email verified successfully'})
        
    except EmailVerification.DoesNotExist:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_phone_verification(request):
    user = request.user
    phone_number = request.data.get('phone_number')
    
    if not phone_number:
        return Response({'error': 'Phone number required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate 6-digit code
    verification_code = ''.join(random.choices(string.digits, k=6))
    expires_at = timezone.now() + timedelta(minutes=10)
    
    phone_verification, created = PhoneVerification.objects.get_or_create(
        user=user,
        defaults={
            'phone_number': phone_number,
            'verification_code': verification_code,
            'expires_at': expires_at
        }
    )
    
    if not created:
        phone_verification.phone_number = phone_number
        phone_verification.verification_code = verification_code
        phone_verification.expires_at = expires_at
        phone_verification.attempts = 0
        phone_verification.is_verified = False
        phone_verification.save()
    
    # TODO: Send actual SMS
    # For now, return the code for testing
    return Response({
        'message': 'Verification code sent',
        'code': verification_code  # Remove this in production
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_phone(request):
    verification_code = request.data.get('verification_code')
    
    if not verification_code:
        return Response({'error': 'Verification code required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        phone_verification = PhoneVerification.objects.get(
            user=request.user,
            is_verified=False
        )
        
        if phone_verification.expires_at < timezone.now():
            return Response({'error': 'Verification code expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        if phone_verification.attempts >= 3:
            return Response({'error': 'Too many attempts'}, status=status.HTTP_400_BAD_REQUEST)
        
        if phone_verification.verification_code != verification_code:
            phone_verification.attempts += 1
            phone_verification.save()
            return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)
        
        phone_verification.is_verified = True
        phone_verification.verified_at = timezone.now()
        phone_verification.save()
        
        # Award verification badge
        VerificationBadge.objects.get_or_create(
            user=request.user,
            badge_type='phone_verified'
        )
        
        return Response({'message': 'Phone verified successfully'})
        
    except PhoneVerification.DoesNotExist:
        return Response({'error': 'No pending phone verification'}, status=status.HTTP_400_BAD_REQUEST)

class VerificationBadgeListView(generics.ListAPIView):
    serializer_class = VerificationBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        username = self.kwargs.get('username')
        if username:
            user = get_object_or_404(User, username=username)
        else:
            user = self.request.user
        
        return VerificationBadge.objects.filter(user=user, is_active=True)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verification_status(request):
    user = request.user
    
    email_verified = EmailVerification.objects.filter(
        user=user, is_verified=True
    ).exists()
    
    phone_verified = PhoneVerification.objects.filter(
        user=user, is_verified=True
    ).exists()
    
    identity_verified = VerificationBadge.objects.filter(
        user=user, badge_type='identity_verified', is_active=True
    ).exists()
    
    return Response({
        'email_verified': email_verified,
        'phone_verified': phone_verified,
        'identity_verified': identity_verified,
        'overall_verified': user.is_verified
    })