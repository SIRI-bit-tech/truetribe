from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Follow, Block
from .serializers import UserSerializer, UserProfileSerializer, FollowSerializer

User = get_user_model()

class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return User.objects.filter(
                Q(username__icontains=query) | 
                Q(first_name__icontains=query) | 
                Q(last_name__icontains=query)
            )
        return User.objects.none()

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserProfileSerializer

class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'
    
    def get_queryset(self):
        return User.objects.all()



@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def follow_user(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    
    if user_to_follow == request.user:
        return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    follow, created = Follow.objects.get_or_create(
        follower=request.user,
        following=user_to_follow
    )
    
    if created:
        user_to_follow.followers_count += 1
        user_to_follow.save()
        request.user.following_count += 1
        request.user.save()
        return Response({'message': 'User followed successfully'})
    else:
        return Response({'error': 'Already following this user'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unfollow_user(request, username):
    user_to_unfollow = get_object_or_404(User, username=username)
    
    try:
        follow = Follow.objects.get(follower=request.user, following=user_to_unfollow)
        follow.delete()
        user_to_unfollow.followers_count -= 1
        user_to_unfollow.save()
        request.user.following_count -= 1
        request.user.save()
        return Response({'message': 'User unfollowed successfully'})
    except Follow.DoesNotExist:
        return Response({'error': 'Not following this user'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_followers(request, username):
    user = get_object_or_404(User, username=username)
    followers = Follow.objects.filter(following=user).select_related('follower')
    serializer = FollowSerializer(followers, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_following(request, username):
    user = get_object_or_404(User, username=username)
    following = Follow.objects.filter(follower=user).select_related('following')
    serializer = FollowSerializer(following, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def block_user(request, username):
    user_to_block = get_object_or_404(User, username=username)
    
    if user_to_block == request.user:
        return Response({'error': 'Cannot block yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    block, created = Block.objects.get_or_create(
        blocker=request.user,
        blocked=user_to_block
    )
    
    if created:
        # Remove follow relationships
        Follow.objects.filter(
            Q(follower=request.user, following=user_to_block) |
            Q(follower=user_to_block, following=request.user)
        ).delete()
        return Response({'message': 'User blocked successfully'})
    else:
        return Response({'error': 'User already blocked'}, status=status.HTTP_400_BAD_REQUEST)