from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import MediaFile

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_media(request):
    # Implementation for media upload
    return Response({'message': 'Media uploaded successfully'})