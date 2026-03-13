import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from core.models import Scheme, RuleEngine, User

def is_admin(request):
    """
    Utility function to verify if the requesting user has the 'Admin' role.
    Requires 'user_id' in the headers or body.
    """
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        return False
        
    user = User.objects.filter(user_id=user_id, role='Admin').first()
    return user is not None

@csrf_exempt
@require_http_methods(["POST"])
def create_scheme(request):
    if not is_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized. Admin access required.'}, status=403)
        
    try:
        data = json.loads(request.body)
        
        scheme_name = data.get('scheme_name')
        if not scheme_name:
            return JsonResponse({'status': 'error', 'message': 'Scheme Name is required'}, status=400)
            
        scheme = Scheme.objects.create(
            scheme_name=scheme_name,
            description=data.get('description', ''),
            benefit_type=data.get('benefit_type', ''),
            state=data.get('state', 'All India'),
            official_link=data.get('official_link', ''),
            registration_link=data.get('registration_link', '')
        )
        
        # Optionally create rules if provided in payload
        rules = data.get('rules', {})
        if rules:
            RuleEngine.objects.create(
                scheme=scheme,
                min_age=rules.get('min_age'),
                max_age=rules.get('max_age'),
                gender=rules.get('gender'),
                min_income=rules.get('min_income'),
                max_income=rules.get('max_income'),
                required_education=rules.get('required_education'),
                disability_required=rules.get('disability_required'),
                pension_required=rules.get('pension_required'),
                occupation_required=rules.get('occupation_required'),
                state_required=rules.get('state_required')
            )
            
        return JsonResponse({'status': 'success', 'message': 'Scheme created successfully', 'scheme_id': scheme.scheme_id})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_scheme(request, scheme_id):
    if not is_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized. Admin access required.'}, status=403)
        
    try:
        scheme = Scheme.objects.filter(scheme_id=scheme_id).first()
        if not scheme:
            return JsonResponse({'status': 'error', 'message': 'Scheme not found'}, status=404)
            
        data = json.loads(request.body)
        
        if 'scheme_name' in data: scheme.scheme_name = data['scheme_name']
        if 'description' in data: scheme.description = data['description']
        if 'benefit_type' in data: scheme.benefit_type = data['benefit_type']
        if 'state' in data: scheme.state = data['state']
        if 'official_link' in data: scheme.official_link = data['official_link']
        if 'registration_link' in data: scheme.registration_link = data['registration_link']
        
        scheme.save()
        return JsonResponse({'status': 'success', 'message': 'Scheme updated successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_scheme(request, scheme_id):
    if not is_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized. Admin access required.'}, status=403)
        
    try:
        scheme = Scheme.objects.filter(scheme_id=scheme_id).first()
        if not scheme:
            return JsonResponse({'status': 'error', 'message': 'Scheme not found'}, status=404)
            
        scheme.delete()
        return JsonResponse({'status': 'success', 'message': 'Scheme deleted successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
@csrf_exempt
@require_http_methods(["GET"])
def get_admin_analytics(request):
    if not is_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)
        
    try:
        from core.models import Grievance, Application, Scheme, User
        from django.db.models import Count
        
        # Scheme distribution by state
        states_data = list(Scheme.objects.values('state').annotate(count=Count('scheme_id')))
        
        # Application status summary
        app_stats = list(Application.objects.values('status').annotate(count=Count('application_id')))
        
        # Grievance sentiment breakdown
        sentiment_stats = list(Grievance.objects.values('sentiment').annotate(count=Count('grievance_id')))
        
        # Recent activity
        recent_apps = Application.objects.select_related('user', 'scheme').order_by('-applied_on')[:10]
        recent_apps_data = [{
            'id': app.application_id,
            'user': app.user.full_name,
            'scheme': app.scheme.scheme_name,
            'status': app.status,
            'date': app.applied_on.isoformat()
        } for app in recent_apps]
        
        return JsonResponse({
            'status': 'success',
            'data': {
                'states_data': states_data,
                'app_stats': app_stats,
                'sentiment_stats': sentiment_stats,
                'recent_activity': recent_apps_data,
                'total_users': User.objects.count(),
                'total_schemes': Scheme.objects.count(),
                'total_applications': Application.objects.count()
            }
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
