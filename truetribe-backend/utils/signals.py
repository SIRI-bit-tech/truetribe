from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from posts.models import Post, PostLike, Comment
from videos.models import Video, VideoLike
from users.models import Follow
from trust_system.models import TrustScore, TrustAction
from notifications.models import Notification

channel_layer = get_channel_layer()

User = get_user_model()

@receiver(post_save, sender=PostLike)
def handle_post_like(sender, instance, created, **kwargs):
    if created:
        # Update post like count
        instance.post.likes_count += 1
        instance.post.save()
        
        # Create notification
        if instance.user != instance.post.author:
            notification = Notification.objects.create(
                recipient=instance.post.author,
                sender=instance.user,
                notification_type='like',
                title='New Like',
                message=f'{instance.user.username} liked your post',
                data={'post_id': str(instance.post.id)}
            )
            
            # Send real-time notification
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'notifications_{instance.post.author.id}',
                    {
                        'type': 'notification_message',
                        'notification': {
                            'id': str(notification.id),
                            'title': notification.title,
                            'message': notification.message,
                            'type': notification.notification_type,
                            'sender': instance.user.username,
                            'created_at': notification.created_at.isoformat()
                        }
                    }
                )
        
        # Record trust action
        TrustAction.objects.create(
            user=instance.user,
            action_type='post_like',
            score_change=0.5,
            description='Liked a post'
        )

@receiver(post_delete, sender=PostLike)
def handle_post_unlike(sender, instance, **kwargs):
    # Update post like count
    instance.post.likes_count = max(0, instance.post.likes_count - 1)
    instance.post.save()

@receiver(post_save, sender=Comment)
def handle_comment_created(sender, instance, created, **kwargs):
    if created:
        # Update post comment count
        instance.post.comments_count += 1
        instance.post.save()
        
        # Create notification
        if instance.author != instance.post.author:
            Notification.objects.create(
                recipient=instance.post.author,
                sender=instance.author,
                notification_type='comment',
                title='New Comment',
                message=f'{instance.author.username} commented on your post',
                data={'post_id': str(instance.post.id), 'comment_id': str(instance.id)}
            )
        
        # Record trust action
        TrustAction.objects.create(
            user=instance.author,
            action_type='comment',
            score_change=1.0,
            description='Added a comment'
        )

@receiver(post_save, sender=Follow)
def handle_follow_created(sender, instance, created, **kwargs):
    if created:
        # Update follower/following counts
        instance.follower.following_count += 1
        instance.follower.save()
        
        instance.following.followers_count += 1
        instance.following.save()
        
        # Create notification
        Notification.objects.create(
            recipient=instance.following,
            sender=instance.follower,
            notification_type='follow',
            title='New Follower',
            message=f'{instance.follower.username} started following you',
            data={'user_id': str(instance.follower.id)}
        )
        
        # Record trust action
        TrustAction.objects.create(
            user=instance.follower,
            action_type='follow',
            score_change=0.5,
            description='Followed a user'
        )

@receiver(post_delete, sender=Follow)
def handle_follow_deleted(sender, instance, **kwargs):
    # Update follower/following counts
    instance.follower.following_count = max(0, instance.follower.following_count - 1)
    instance.follower.save()
    
    instance.following.followers_count = max(0, instance.following.followers_count - 1)
    instance.following.save()

@receiver(post_save, sender=Post)
def handle_post_created(sender, instance, created, **kwargs):
    if created:
        # Update user's post count
        instance.author.posts_count += 1
        instance.author.save()
        
        # Record trust action
        TrustAction.objects.create(
            user=instance.author,
            action_type='post_like',
            score_change=2.0,
            description='Created a post'
        )

@receiver(post_save, sender=VideoLike)
def handle_video_like(sender, instance, created, **kwargs):
    if created:
        # Update video like count
        instance.video.likes_count += 1
        instance.video.save()
        
        # Create notification
        if instance.user != instance.video.author:
            Notification.objects.create(
                recipient=instance.video.author,
                sender=instance.user,
                notification_type='like',
                title='Video Liked',
                message=f'{instance.user.username} liked your video',
                data={'video_id': str(instance.video.id)}
            )

@receiver(post_save, sender=TrustAction)
def update_trust_score(sender, instance, created, **kwargs):
    if created:
        # Update user's trust score
        trust_score, created_score = TrustScore.objects.get_or_create(user=instance.user)
        
        if instance.action_type in ['post_like', 'post_share', 'comment', 'follow']:
            trust_score.activity_score += instance.score_change
        elif instance.action_type == 'verification':
            trust_score.verification_bonus += instance.score_change
        elif instance.action_type in ['report_resolved']:
            trust_score.community_score += instance.score_change
        elif instance.action_type in ['spam_detected', 'scam_detected']:
            trust_score.penalty_score += abs(instance.score_change)
        
        trust_score.calculate_final_score()