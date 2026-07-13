from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class PropertyListView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        return Response({
            "success": True,
            "data": [],
            "pagination": {
                "page": 1,
                "pageSize": 12,
                "total": 0,
                "totalPages": 0,
                "hasNext": False,
                "hasPrevious": False
            }
        }, status=status.HTTP_200_OK)
