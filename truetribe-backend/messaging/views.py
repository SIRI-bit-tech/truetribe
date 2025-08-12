from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Conversation, Message, MessageRead, MessageReaction
from .serializers import ConversationSerializer, MessageSerializer, MessageCreateSerializer

User = get_user_model()

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages')
    
    def perform_create(self, serializer):
        participant_id = self.request.data.get('participant')
        if participant_id:
            participant = get_object_or_404(User, id=participant_id)
            conversation = serializer.save(created_by=self.request.user)
            conversation.participants.add(self.request.user, participant)

class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            participants=self.request.user
        )
        return Message.objects.filter(conversation=conversation).select_related('sender')
    
    def perform_create(self, serializer):
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            participants=self.request.user
        )
        message = serializer.save(
            conversation=conversation,
            sender=self.request.user
        )
        conversation.updated_at = message.created_at
        conversation.save()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_conversation(request):
    participant_ids = request.data.get('participants', [])
    is_group = request.data.get('is_group', False)
    group_name = request.data.get('group_name', '')
    
    if not participant_ids:
        return Response({'error': 'Participants required'}, status=status.HTTP_400_BAD_REQUEST)
    
    participants = User.objects.filter(id__in=participant_ids)
    
    if not is_group and len(participant_ids) == 1:
        # Check if conversation already exists
        other_user = participants.first()
        existing_conversation = Conversation.objects.filter(
            participants=request.user,
            is_group=False
        ).filter(participants=other_user).first()
        
        if existing_conversation:
            serializer = ConversationSerializer(existing_conversation, context={'request': request})
            return Response(serializer.data)
    
    conversation = Conversation.objects.create(
        is_group=is_group,
        group_name=group_name,
        created_by=request.user
    )
    conversation.participants.add(request.user, *participants)
    
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, conversation_id):
    conversation = get_object_or_404(
        Conversation,
        id=conversation_id,
        participants=request.user
    )
    
    unread_messages = Message.objects.filter(
        conversation=conversation
    ).exclude(sender=request.user).exclude(
        read_by__user=request.user
    )
    
    for message in unread_messages:
        MessageRead.objects.get_or_create(message=message, user=request.user)
    
    return Response({'message': 'Messages marked as read'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def react_to_message(request, message_id):
    message = get_object_or_404(Message, id=message_id)
    reaction_type = request.data.get('reaction_type')
    
    if reaction_type not in dict(MessageReaction.REACTION_TYPES):
        return Response({'error': 'Invalid reaction type'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user is participant in conversation
    if not message.conversation.participants.filter(id=request.user.id).exists():
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    reaction, created = MessageReaction.objects.get_or_create(
        message=message,
        user=request.user,
        defaults={'reaction_type': reaction_type}
    )
    
    if not created:
        if reaction.reaction_type == reaction_type:
            reaction.delete()
            return Response({'message': 'Reaction removed'})
        else:
            reaction.reaction_type = reaction_type
            reaction.save()
            return Response({'message': 'Reaction updated'})
    
    return Response({'message': 'Reaction added'})

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_message(request, message_id):
    message = get_object_or_404(Message, id=message_id, sender=request.user)
    message.delete()
    return Response({'message': 'Message deleted'})

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def edit_message(request, message_id):
    message = get_object_or_404(Message, id=message_id, sender=request.user)
    
    if message.message_type != 'text':
        return Response({'error': 'Only text messages can be edited'}, status=status.HTTP_400_BAD_REQUEST)
    
    content = request.data.get('content', '').strip()
    if not content:
        return Response({'error': 'Content cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    message.content = content
    message.is_edited = True
    message.save()
    
    serializer = MessageSerializer(message, context={'request': request})
    return Response(serializer.data)