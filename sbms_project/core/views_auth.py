import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from core.models import User
import uuid

@csrf_exempt
def register_user(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name', 'Citizen')
        
        if not email or not password:
            return JsonResponse({'status': 'error', 'message': 'Email and passwords are required'}, status=400)
            
        # Check if user exists
        if User.objects.filter(email=email).exists():
            return JsonResponse({'status': 'error', 'message': 'Email already registered'}, status=409)
            
        # Create a mock Aadhaar for email registrations if absent
        mock_aadhaar = str(uuid.uuid4()).replace('-', '')[:12]
            
        user = User.objects.create(
            full_name=full_name,
            email=email,
            password=make_password(password),
            dob='1990-01-01', # Defaults required by schema
            gender='Other',
            aadhaar_no=mock_aadhaar,
            state='Tamil Nadu',
            district='Chennai',
            income=0,
            occupation='Unemployed',
            education='None'
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'Registration successful',
            'user': {
                'id': user.user_id,
                'email': user.email,
                'full_name': user.full_name
            }
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({'status': 'error', 'message': 'Email and passwords are required'}, status=400)
            
        user = User.objects.filter(email=email).first()
        if not user or not check_password(password, user.password):
            return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=401)
            
        return JsonResponse({
            'status': 'success',
            'message': 'Login successful',
            'user': {
                'id': user.user_id,
                'email': user.email,
                'full_name': user.full_name
            }
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
def google_auth(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        email = data.get('email')
        full_name = data.get('name', 'Citizen')
        
        if not email:
            return JsonResponse({'status': 'error', 'message': 'Email from Google payload required'}, status=400)
            
        user = User.objects.filter(email=email).first()
        
        if not user:
            # Create user for first time google sign in
            mock_aadhaar = str(uuid.uuid4()).replace('-', '')[:12]
            user = User.objects.create(
                full_name=full_name,
                email=email,
                dob='1990-01-01',
                gender='Other',
                aadhaar_no=mock_aadhaar,
                state='Tamil Nadu',
                district='Chennai',
                income=0,
                occupation='Unemployed',
                education='None'
            )
            
        return JsonResponse({
            'status': 'success',
            'message': 'Google authentication successful',
            'user': {
                'id': user.user_id,
                'email': user.email,
                'full_name': user.full_name
            }
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
