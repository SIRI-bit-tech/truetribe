from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Post, Comment, PostLike, CommentLike, PostShare
from .serializers import PostSerializer, PostCreateSerializer, CommentSerializer
from users.models import Follow

class PostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Get posts from followed users and own posts
        following_users = Follow.objects.filter(follower=user).values_list('following', flat=True)
        queryset = Post.objects.filter(
            Q(author__in=following_users) | Q(author=user)
        ).select_related('author').prefetch_related('likes', 'comments')
        return queryset

class PostCreateView(generics.CreateAPIView):
    serializer_class = PostCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Post.objects.all()
    
    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own posts")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own posts")
        instance.delete()



@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def like_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    like, created = PostLike.objects.get_or_create(user=request.user, post=post)
    
    if created:
        post.likes_count += 1
        post.save()
        return Response({'message': 'Post liked', 'liked': True})
    else:
        like.delete()
        post.likes_count -= 1
        post.save()
        return Response({'message': 'Post unliked', 'liked': False})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bookmark_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    # Bookmark logic here
    return Response({'message': 'Post bookmarked'})

class StoriesView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return stories (posts with is_story=True if you add that field)
        return Post.objects.none()  # Placeholder

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def view_story(request, story_id):
    # Story view logic
    return Response({'message': 'Story viewed'})

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id, parent=None).select_related('author')
    
    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id)
        comment = serializer.save(author=self.request.user, post=post)
        post.comments_count += 1
        post.save()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def like_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)
    
    if created:
        comment.likes_count += 1
        comment.save()
        return Response({'message': 'Comment liked', 'liked': True})
    else:
        like.delete()
        comment.likes_count -= 1
        comment.save()
        return Response({'message': 'Comment unliked', 'liked': False})

class CommentRepliesView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        comment_id = self.kwargs['comment_id']
        return Comment.objects.filter(parent_id=comment_id).select_related('author')
    
    def perform_create(self, serializer):
        comment_id = self.kwargs['comment_id']
        parent_comment = get_object_or_404(Comment, id=comment_id)
        serializer.save(author=self.request.user, post=parent_comment.post, parent=parent_comment)