from accounts.api.serializers import UserSignUpSerializer
import hashlib
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from accounts.models import UserSession
from audits.models import AuditLog
from .serializers import CustomTokenObtainPairSerializer
from core.jwt import CustomJWTAuthentication

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({"success": False, "error": {"message": "Not authenticated"}}, status=status.HTTP_401_UNAUTHORIZED)
            
        user = request.user
        role_name = "normal"
        first_role = user.user_roles.first()
        if first_role and first_role.role:
            role_name = first_role.role.name.lower()
            
        return Response({
            "success": True,
            "data": {
                "id": str(user.id),
                "email": user.email,
                "full_name": f"{user.first_name} {user.last_name}".strip(),
                "phone": user.phone_number,
                "role": role_name,
                "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') else "",
                "updated_at": user.updated_at.isoformat() if hasattr(user, 'updated_at') else "",
            }
        }, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        validated_data = serializer.validated_data

        if validated_data.get("mfa_required"):
            return Response(validated_data, status=status.HTTP_200_OK)

        access_token = validated_data.get("access")
        refresh_token = validated_data.get("refresh")

        user = serializer.user
        role_name = "normal"
        first_role = user.user_roles.first()
        if first_role and first_role.role:
            role_name = first_role.role.name.lower()

        response = Response({
            "success": True,
            "data": {
                "access_token": access_token,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": f"{user.first_name} {user.last_name}".strip(),
                    "phone": user.phone_number,
                    "role": role_name,
                    "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') else "",
                    "updated_at": user.updated_at.isoformat() if hasattr(user, 'updated_at') else "",
                }
            }
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key=settings.REFRESH_COOKIE_NAME,
            value=refresh_token,
            httponly=settings.REFRESH_COOKIE_HTTPONLY,
            secure=settings.REFRESH_COOKIE_SECURE,
            samesite=settings.REFRESH_COOKIE_SAMESITE,
            path=settings.REFRESH_COOKIE_PATH,
            max_age=int(settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME").total_seconds()),
        )
        return response


class CustomTokenRefreshView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if not refresh_token:
            raise InvalidToken("Refresh token not found in cookies.")

        old_hash = hashlib.sha256(refresh_token.encode('utf-8')).hexdigest()

        session = UserSession.objects.filter(
            refresh_token_hash=old_hash,
            is_revoked=False
        ).first()

        if not session:
            raise InvalidToken("Session is revoked or expired.")

        try:
            token = RefreshToken(refresh_token)
            data = {"access": str(token.access_token)}

            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
                try:
                    token.blacklist()
                except AttributeError:
                    pass

                token.set_jti()
                token.set_exp()
                token.set_iat()
                token.outstand()

                new_refresh_token = str(token)
                new_hash = hashlib.sha256(new_refresh_token.encode('utf-8')).hexdigest()

                session.refresh_token_hash = new_hash
                session.expires_at = timezone.now() + settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME")
                session.save()
            else:
                new_refresh_token = refresh_token

            data = {
                "success": True,
                "data": {
                    "access_token": str(token.access_token)
                }
            }

        except TokenError as e:
            raise InvalidToken(e.args[0])

        response = Response(data, status=status.HTTP_200_OK)

        response.set_cookie(
            key=settings.REFRESH_COOKIE_NAME,
            value=new_refresh_token,
            httponly=settings.REFRESH_COOKIE_HTTPONLY,
            secure=settings.REFRESH_COOKIE_SECURE,
            samesite=settings.REFRESH_COOKIE_SAMESITE,
            path=settings.REFRESH_COOKIE_PATH,
            max_age=int(settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME").total_seconds()),
        )

        return response


class CustomLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        
        ip = request.META.get('REMOTE_ADDR')
        device = request.META.get('HTTP_USER_AGENT')

        if refresh_token:
            refresh_hash = hashlib.sha256(refresh_token.encode('utf-8')).hexdigest()

            session = UserSession.objects.filter(
                user=request.user,
                refresh_token_hash=refresh_hash,
                is_revoked=False
            ).first()

            if session:
                session.is_revoked = True
                session.save()

            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        AuditLog.objects.create(
            user=request.user,
            action="UserLogout",
            entity_type="User",
            entity_id=request.user.id,
            ip_address=ip,
            user_agent=device
        )

        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie(
            key=settings.REFRESH_COOKIE_NAME,
            path=settings.REFRESH_COOKIE_PATH
        )
        return response

class SignupUser(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        print('yes')
        serializer = UserSignUpSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        user = serializer.save()

        response_dict = {
            "success": True,
            "data": {
                "id": str(user.id),
                "email": user.email,
                "full_name": f"{user.first_name} {user.last_name}".strip(),
                "phone": user.phone_number,
                "role": "normal",
                "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') else "",
                "updated_at": user.updated_at.isoformat() if hasattr(user, 'updated_at') else "",
            },
            "message": "User created successfully."
        }

        return Response(response_dict, status=status.HTTP_201_CREATED)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        user = request.user
        data = request.data

        if "full_name" in data:
            full_name = data["full_name"].strip()
            names = full_name.split()
            user.first_name = names[0]
            user.last_name = " ".join(names[1:]) if len(names) > 1 else ""

        if "phone" in data:
            user.phone_number = data["phone"]

        if "avatar_url" in data:
            user.profile_image_url = data["avatar_url"]

        user.save()

        role_name = "normal"
        first_role = user.user_roles.first()
        if first_role and first_role.role:
            role_name = first_role.role.name.lower()

        return Response({
            "success": True,
            "data": {
                "id": str(user.id),
                "email": user.email,
                "full_name": f"{user.first_name} {user.last_name}".strip(),
                "phone": user.phone_number,
                "role": role_name,
                "created_at": user.created_at.isoformat() if hasattr(user, 'created_at') else "",
                "updated_at": user.updated_at.isoformat() if hasattr(user, 'updated_at') else "",
            },
            "message": "Profile updated successfully."
        }, status=status.HTTP_200_OK)
            