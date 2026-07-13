import hashlib
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core.jwt import CustomJWTAuthentication
from properties.models import Property, PropertyType, PropertyMedia
from geo.models import Country, State, District, City

def serialize_property(property_obj):
    images = list(property_obj.media.filter(media_type='Image').order_by('sort_order').values_list('media_url', flat=True))
    if not images:
        images = ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']

    videos = list(property_obj.media.filter(media_type='Video').order_by('sort_order').values_list('media_url', flat=True))

    owner = property_obj.owner
    owner_data = {
        "id": str(owner.id),
        "email": owner.email,
        "full_name": f"{owner.first_name} {owner.last_name}".strip(),
        "role": "normal"
    }

    return {
        "id": str(property_obj.id),
        "title": property_obj.title,
        "description": property_obj.description,
        "price": float(property_obj.price),
        "property_type": property_obj.property_type.name.lower() if property_obj.property_type else "flat",
        "listing_type": property_obj.listing_purpose.lower(),
        "bedrooms": property_obj.bedrooms,
        "bathrooms": property_obj.bathrooms,
        "area_sqft": float(property_obj.area_sqft) if property_obj.area_sqft else None,
        "address": property_obj.address_line_1,
        "city": property_obj.city.name if property_obj.city else "",
        "state": property_obj.state.name if property_obj.state else "",
        "zip_code": property_obj.zip_code,
        "latitude": float(property_obj.latitude) if property_obj.latitude else None,
        "longitude": float(property_obj.longitude) if property_obj.longitude else None,
        "images": images,
        "videos": videos,
        "status": "published",
        "is_published": True,
        "user_id": str(owner.id),
        "user": owner_data,
        "total_rooms": property_obj.bedrooms,
        "is_furnished": property_obj.furnishing_status == 'Furnished',
        "furniture_list": [],
        "num_beds": 1,
        "is_upstairs": False,
        "water_source": "municipal",
        "power_backup": "none",
        "parking": "none",
        "gated_community": False,
        "security_features": [],
        "preferred_tenant": "any",
        "preferred_gender": "any",
        "sharing_occupancy": None,
        "food_included": False,
        "wifi_available": False,
        "ac_available": False,
        "laundry_available": False,
        "created_at": property_obj.created_at.isoformat() if hasattr(property_obj, 'created_at') else "",
        "updated_at": property_obj.updated_at.isoformat() if hasattr(property_obj, 'updated_at') else "",
    }

class PropertyListView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = []

    def get(self, request, *args, **kwargs):
        queryset = Property.objects.all().order_by('-created_at')
        
        city = request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__name__icontains=city)
            
        state = request.query_params.get('state')
        if state:
            queryset = queryset.filter(state__name__icontains=state)
            
        min_price = request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        max_price = request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        prop_type = request.query_params.get('property_type')
        if prop_type:
            queryset = queryset.filter(property_type__name__iexact=prop_type)
            
        listing_type = request.query_params.get('listing_type')
        if listing_type:
            lt_lower = listing_type.lower()
            if lt_lower == "rent":
                purpose = "Rent"
            elif lt_lower == "roommate":
                purpose = "Roommate"
            else:
                purpose = "Sale"
            queryset = queryset.filter(listing_purpose=purpose)

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 12))
        
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_queryset = queryset[start:end]
        serialized_data = [serialize_property(p) for p in paginated_queryset]
        
        total_pages = (total + page_size - 1) // page_size
        
        return Response({
            "success": True,
            "data": serialized_data,
            "pagination": {
                "page": page,
                "pageSize": page_size,
                "total": total,
                "totalPages": total_pages,
                "hasNext": page < total_pages,
                "hasPrevious": page > 1
            }
        }, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({
                "success": False, 
                "error": {"message": "Authentication credentials were not provided."}
            }, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data
        user = request.user

        # Get or create geo models
        city_name = data.get("city", "Kochi").strip()
        state_name = data.get("state", "Kerala").strip()
        
        country, _ = Country.objects.get_or_create(
            name="India",
            defaults={"country_code": "IN", "currency_code": "INR"}
        )
        state_obj, _ = State.objects.get_or_create(
            country=country,
            name=state_name
        )
        district_obj, _ = District.objects.get_or_create(
            state=state_obj,
            name=city_name
        )
        city_obj, _ = City.objects.get_or_create(
            district=district_obj,
            name=city_name
        )

        # Get or create PropertyType
        prop_type_name = data.get("property_type", "flat").strip().lower()
        property_type_obj, _ = PropertyType.objects.get_or_create(
            name=prop_type_name.capitalize(),
            defaults={"description": f"{prop_type_name.capitalize()} Type"}
        )

        # Map listing purpose
        listing_type = data.get("listing_type", "rent").strip().lower()
        if listing_type == "roommate":
            listing_purpose = "Roommate"
        elif listing_type == "sale":
            listing_purpose = "Sale"
        else:
            listing_purpose = "Rent"

        # Create Property
        property_obj = Property.objects.create(
            owner=user,
            property_type=property_type_obj,
            title=data.get("title", "Untitled Property"),
            description=data.get("description"),
            country=country,
            state=state_obj,
            city=city_obj,
            address_line_1=data.get("address", "N/A"),
            zip_code=data.get("zip_code"),
            price=float(data.get("price", 0)),
            currency_code="INR",
            listing_purpose=listing_purpose,
            available_from=timezone.now().date(),
            bedrooms=int(data.get("bedrooms")) if data.get("bedrooms") else None,
            bathrooms=int(data.get("bathrooms")) if data.get("bathrooms") else None,
            area_sqft=float(data.get("area_sqft")) if data.get("area_sqft") else None,
            furnishing_status="Furnished" if data.get("is_furnished") == "true" else "Unfurnished",
            listing_status="Active"
        )

        # Mock beautiful Unsplash images matching the type
        MOCK_IMAGES = {
            'flat': [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
            ],
            'house': [
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
            ],
            'hostel': [
                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
            ],
            'pg': [
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
            ]
        }
        
        urls = MOCK_IMAGES.get(prop_type_name, MOCK_IMAGES['flat'])
        for idx, url in enumerate(urls):
            PropertyMedia.objects.create(
                property=property_obj,
                media_type='Image',
                media_url=url,
                sort_order=idx,
                is_primary=(idx == 0)
            )

        return Response({
            "success": True,
            "data": serialize_property(property_obj),
            "message": "Property listed successfully."
        }, status=status.HTTP_201_CREATED)

class PropertyDetailView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = []

    def get(self, request, pk, *args, **kwargs):
        try:
            property_obj = Property.objects.get(id=pk)
            return Response({
                "success": True,
                "data": serialize_property(property_obj)
            }, status=status.HTTP_200_OK)
        except Property.DoesNotExist:
            return Response({
                "success": False, 
                "error": {"message": "Property not found"}
            }, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({
                "success": False, 
                "error": {"message": "Authentication credentials were not provided."}
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            property_obj = Property.objects.get(id=pk)
            if property_obj.owner != request.user and not request.user.is_superuser:
                return Response({
                    "success": False, 
                    "error": {"message": "You do not have permission to delete this property."}
                }, status=status.HTTP_403_FORBIDDEN)
                
            property_obj.delete()
            return Response({
                "success": True,
                "message": "Property deleted successfully."
            }, status=status.HTTP_200_OK)
        except Property.DoesNotExist:
            return Response({
                "success": False, 
                "error": {"message": "Property not found"}
            }, status=status.HTTP_404_NOT_FOUND)

class PropertyPostAdsView(PropertyListView):
    pass
