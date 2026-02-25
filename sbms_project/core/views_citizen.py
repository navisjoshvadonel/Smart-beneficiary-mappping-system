import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from core.models import User, UserEligibility, Scheme, Category, Application, Grievance
from core.services.eligibility_service import EligibilityService
from django.db.models import Count

@csrf_exempt
@require_http_methods(["GET"])
def citizen_dashboard_data(request, user_id):
    try:
        user = User.objects.filter(user_id=user_id).first()
        if not user:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

        # Trigger eligibility check to ensure mapping is up to date against the 300 dataset rules
        try:
            EligibilityService.check_user_eligibility(user.user_id)
        except Exception as e:
            print(f"Eligibility warning: {e}")

        eligibilities = UserEligibility.objects.filter(user=user, eligibility_status='Eligible')
        
        matched_schemes = []
        for e in eligibilities:
            matched_schemes.append({
                'id': e.scheme.scheme_id,
                'name': e.scheme.scheme_name,
                'category': e.scheme.benefit_type or 'General',
                'state': e.scheme.state,
                'link': e.scheme.official_link
            })

        applications = Application.objects.filter(user=user).order_by('-applied_on')[:3]
        recent_apps = []
        for a in applications:
            recent_apps.append({
                'id': a.application_id,
                'name': a.scheme.scheme_name,
                'status': a.status,
                'appliedOn': a.applied_on.strftime('%d %b %Y')
            })

        metrics = {
            'eligible': eligibilities.count(),
            'categories': eligibilities.values('scheme__benefit_type').distinct().count(),
            'applications': Application.objects.filter(user=user).count(),
            'grievances': Grievance.objects.filter(user=user).count()
        }

        return JsonResponse({
            'status': 'success',
            'metrics': metrics,
            'schemes': matched_schemes,
            'recent_applications': recent_apps
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def citizen_applications(request, user_id):
    user = User.objects.filter(user_id=user_id).first()
    if not user:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

    if request.method == "GET":
        apps = Application.objects.filter(user=user).order_by('-applied_on')
        data = []
        for a in apps:
            data.append({
                'id': f"APP-{a.application_id}",
                'name': a.scheme.scheme_name,
                'category': a.scheme.benefit_type or 'General',
                'status': a.status,
                'appliedOn': a.applied_on.strftime('%d %b %Y')
            })
        return JsonResponse({'status': 'success', 'applications': data})
        
    elif request.method == "POST":
        try:
            body = json.loads(request.body)
            scheme_id = body.get('scheme_id')
            scheme = Scheme.objects.filter(scheme_id=scheme_id).first()
            if not scheme:
                return JsonResponse({'status': 'error', 'message': 'Scheme not found'}, status=400)
            
            Application.objects.create(user=user, scheme=scheme, status='Pending')
            return JsonResponse({'status': 'success', 'message': 'Application submitted successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def citizen_grievances(request, user_id):
    user = User.objects.filter(user_id=user_id).first()
    if not user:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

    if request.method == "GET":
        grievances = Grievance.objects.filter(user=user).order_by('-raised_on')
        data = []
        for g in grievances:
            data.append({
                'id': f"GRV-{g.grievance_id}",
                'complaint': g.complaint_text,
                'status': g.status,
                'raisedOn': g.raised_on.strftime('%d %b %Y')
            })
        return JsonResponse({'status': 'success', 'grievances': data})

    elif request.method == "POST":
        try:
            body = json.loads(request.body)
            complaintText = body.get('complaint')
            if not complaintText:
                return JsonResponse({'status': 'error', 'message': 'Complaint details required'}, status=400)
            
            Grievance.objects.create(user=user, complaint_text=complaintText, status='Open')
            return JsonResponse({'status': 'success', 'message': 'Grievance submitted successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def search_schemes(request):
    try:
        query = request.GET.get('q', '').lower()
        state_filter = request.GET.get('state', '')
        type_filter = request.GET.get('type', '')

        schemes = Scheme.objects.all()

        if query:
            schemes = schemes.filter(scheme_name__icontains=query)
        if state_filter and state_filter != 'All States':
            schemes = schemes.filter(state__icontains=state_filter)
        if type_filter and type_filter != 'All Types':
            schemes = schemes.filter(benefit_type__icontains=type_filter)

        schemas_data = []
        for s in schemes[:50]: # limit to 50 for performance
            schemas_data.append({
                'id': s.scheme_id,
                'name': s.scheme_name,
                'state': s.state,
                'benefit_type': s.benefit_type or 'General Output',
                'description': s.description or 'No details available.'
            })

        return JsonResponse({'status': 'success', 'schemes': schemas_data})
    except Exception as e:
         return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET", "PUT"])
def get_update_profile(request, user_id):
    user = User.objects.filter(user_id=user_id).first()
    if not user:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

    if request.method == "GET":
        return JsonResponse({
            'status': 'success',
            'profile': {
                'dob': user.dob.strftime('%Y-%m-%d') if user.dob else '',
                'gender': user.gender or '',
                'income': str(user.income) if user.income else '',
                'occupation': user.occupation or '',
                'education': user.education or '',
                'disability_status': user.disability_status,
                'pension_status': user.pension_status,
                'state': user.state or ''
            }
        })
    elif request.method == "PUT":
        try:
            body = json.loads(request.body)
            # Update user fields
            if 'dob' in body and body['dob']:
                user.dob = body['dob']
            if 'gender' in body:
                user.gender = body['gender']
            if 'income' in body and body['income']:
                user.income = body['income']
            if 'occupation' in body:
                user.occupation = body['occupation']
            if 'education' in body:
                user.education = body['education']
            if 'disability_status' in body:
                user.disability_status = bool(body['disability_status'])
            if 'pension_status' in body:
                user.pension_status = bool(body['pension_status'])
            if 'state' in body:
                user.state = body['state']
            
            user.save()
            
            # Immediately trigger rules engine evaluation
            try:
                EligibilityService.check_user_eligibility(user.user_id)
            except Exception as e:
                print(f"Eligibility error post-profile update: {e}")

            return JsonResponse({'status': 'success', 'message': 'Profile updated and eligibility re-evaluated.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
