from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import LiveStream
from .serializers import LiveStreamSerializer

class LiveStreamListCreateView(generics.ListCreateAPIView):
    serializer_class = LiveStreamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LiveStream.objects.filter(is_live=True)
    
    def perform_create(self, serializer):
        serializer.save(streamer=self.request.user)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def end_stream(request, stream_id):
    stream = get_object_or_404(LiveStream, id=stream_id, streamer=request.user)
    stream.is_live = False
    stream.ended_at = timezone.now()
    stream.save()
    return Response({'message': 'Stream ended'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_stream(request, stream_id):
    stream = get_object_or_404(LiveStream, id=stream_id)
    stream.viewers_count += 1
    stream.save()
    return Response({'message': 'Joined stream'})