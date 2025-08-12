from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, F
from .models import Video, VideoComment, VideoLike, VideoView, VideoShare
from .serializers import VideoSerializer, VideoCreateSerializer, VideoCommentSerializer
from users.models import Follow

class VideoListView(generics.ListAPIView):
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        following_users = Follow.objects.filter(follower=user).values_list('following', flat=True)
        queryset = Video.objects.filter(
            Q(author__in=following_users) | Q(author=user),
            is_public=True
        ).select_related('author').prefetch_related('likes', 'comments')
        return queryset

class VideoCreateView(generics.CreateAPIView):
    serializer_class = VideoCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Video.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Record video view
        ip_address = request.META.get('REMOTE_ADDR')
        VideoView.objects.get_or_create(
            user=request.user if request.user.is_authenticated else None,
            video=instance,
            ip_address=ip_address,
            defaults={'watched_duration': 0}
        )
        # Increment view count
        Video.objects.filter(id=instance.id).update(views_count=F('views_count') + 1)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own videos")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own videos")
        instance.delete()

class TrendingVideosView(generics.ListAPIView):
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Video.objects.filter(is_public=True).order_by('-views_count', '-likes_count')[:50]

class UserVideosView(generics.ListAPIView):
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        username = self.kwargs['username']
        return Video.objects.filter(
            author__username=username,
            is_public=True
        ).select_related('author')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def like_video(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    like, created = VideoLike.objects.get_or_create(user=request.user, video=video)
    
    if created:
        video.likes_count += 1
        video.save()
        return Response({'message': 'Video liked', 'liked': True})
    else:
        like.delete()
        video.likes_count -= 1
        video.save()
        return Response({'message': 'Video unliked', 'liked': False})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def share_video(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    share, created = VideoShare.objects.get_or_create(user=request.user, video=video)
    
    if created:
        video.shares_count += 1
        video.save()
        return Response({'message': 'Video shared'})
    else:
        return Response({'error': 'Video already shared'}, status=status.HTTP_400_BAD_REQUEST)

class VideoCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = VideoCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        video_id = self.kwargs['video_id']
        return VideoComment.objects.filter(video_id=video_id, parent=None).select_related('author')
    
    def perform_create(self, serializer):
        video_id = self.kwargs['video_id']
        video = get_object_or_404(Video, id=video_id)
        comment = serializer.save(author=self.request.user, video=video)
        video.comments_count += 1
        video.save()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_watch_time(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    watched_duration = request.data.get('watched_duration', 0)
    ip_address = request.META.get('REMOTE_ADDR')
    
    video_view, created = VideoView.objects.get_or_create(
        user=request.user,
        video=video,
        ip_address=ip_address,
        defaults={'watched_duration': watched_duration}
    )
    
    if not created:
        video_view.watched_duration = max(video_view.watched_duration, watched_duration)
        video_view.save()
    
    return Response({'message': 'Watch time updated'})