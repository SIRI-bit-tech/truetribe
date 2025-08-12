from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import ScamReport

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def report_scam(request):
    # Implementation for scam reporting
    return Response({'message': 'Scam reported successfully'})