# middleware.py
from django.contrib.auth.models import User
from django.contrib.auth import login
import jwt
from functools import wraps

class ClerkAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            session_token = request.headers.get('Authorization')
            
            if session_token and session_token.startswith('Bearer '):
                token = session_token.split(' ')[1]
                # In production, you should verify this token with Clerk's API
                user_data = jwt.decode(token, options={"verify_signature": False})
                
                # Get or create user based on Clerk's user ID
                user, created = User.objects.get_or_create(
                    username=user_data['sub'],
                    defaults={
                        'email': user_data.get('email', ''),
                        'first_name': user_data.get('first_name', ''),
                        'last_name': user_data.get('last_name', '')
                    }
                )
                
                request.user = user
                
        except Exception as e:
            print(f"Auth error: {str(e)}")

        response = self.get_response(request)
        return response