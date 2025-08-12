from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import TrustScore, TrustAction, UserReport, TrustBadge
from .serializers import (
    TrustScoreSerializer, TrustActionSerializer, UserReportSerializer,
    UserReportCreateSerializer, TrustBadgeSerializer
)

User = get_user_model()

class UserTrustScoreView(generics.RetrieveAPIView):
    serializer_class = TrustScoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs.get('user_id')
        if user_id:
            user = get_object_or_404(User, id=user_id)
        else:
            user = self.request.user
        
        trust_score, created = TrustScore.objects.get_or_create(user=user)
        if created:
            trust_score.calculate_final_score()
        return trust_score

class ReportScamView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Scam reporting logic
        return Response({'message': 'Scam reported successfully'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def fact_check_post(request, post_id):
    # Fact checking logic
    return Response({'message': 'Fact check submitted'})



@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def record_trust_action(request):
    action_type = request.data.get('action_type')
    score_change = request.data.get('score_change', 0)
    description = request.data.get('description', '')
    
    if not action_type:
        return Response({'error': 'Action type required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create trust action
    trust_action = TrustAction.objects.create(
        user=request.user,
        action_type=action_type,
        score_change=score_change,
        description=description
    )
    
    # Update user's trust score
    trust_score, created = TrustScore.objects.get_or_create(user=request.user)
    
    if action_type in ['post_like', 'post_share', 'comment', 'follow']:
        trust_score.activity_score += score_change
    elif action_type == 'verification':
        trust_score.verification_bonus += score_change
    elif action_type in ['report_resolved']:
        trust_score.community_score += score_change
    elif action_type in ['spam_detected', 'scam_detected', 'report_false']:
        trust_score.penalty_score += abs(score_change)
    
    trust_score.calculate_final_score()
    
    serializer = TrustActionSerializer(trust_action)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserReportCreateView(generics.CreateAPIView):
    serializer_class = UserReportCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        reported_user = serializer.validated_data['reported_user']
        if reported_user == self.request.user:
            raise serializers.ValidationError("Cannot report yourself")
        
        serializer.save(reporter=self.request.user)

class UserReportListView(generics.ListAPIView):
    serializer_class = UserReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see reports they made
        return UserReport.objects.filter(reporter=self.request.user).order_by('-created_at')

class TrustBadgeListView(generics.ListAPIView):
    serializer_class = TrustBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        username = self.kwargs.get('username')
        if username:
            user = get_object_or_404(User, username=username)
        else:
            user = self.request.user
        
        return TrustBadge.objects.filter(user=user, is_active=True)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def award_badge(request, username):
    user = get_object_or_404(User, username=username)
    badge_type = request.data.get('badge_type')
    
    if badge_type not in dict(TrustBadge.BADGE_TYPES):
        return Response({'error': 'Invalid badge type'}, status=status.HTTP_400_BAD_REQUEST)
    
    badge, created = TrustBadge.objects.get_or_create(
        user=user,
        badge_type=badge_type,
        defaults={'is_active': True}
    )
    
    if created:
        # Award trust score bonus for badge
        trust_score, _ = TrustScore.objects.get_or_create(user=user)
        if badge_type.startswith('verified_'):
            trust_score.verification_bonus += 5.0
        else:
            trust_score.community_score += 10.0
        trust_score.calculate_final_score()
        
        return Response({'message': 'Badge awarded successfully'})
    else:
        return Response({'error': 'Badge already exists'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def trust_leaderboard(request):
    top_users = User.objects.filter(
        trust_score__gte=80.0
    ).order_by('-trust_score')[:50]
    
    leaderboard = []
    for i, user in enumerate(top_users, 1):
        leaderboard.append({
            'rank': i,
            'username': user.username,
            'trust_score': user.trust_score,
            'is_verified': user.is_verified,
            'profile_picture': user.profile_picture.url if user.profile_picture else None
        })
    
    return Response(leaderboard)