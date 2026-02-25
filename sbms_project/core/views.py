from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime

from core.models import User, UserEligibility, Scheme
from core.services.eligibility_service import EligibilityService
from core.services.nlp_scheme_finder import NLPSchemeFinderService
from core.services.analytics_engine import AdminAnalyticsEngine

@csrf_exempt
@require_http_methods(["POST"])
def update_profile(request):
    try:
        data = json.loads(request.body)
        
        # We will create or update based on aadhaar since it's unique
        aadhaar = data.get('uid') or data.get('aadhaar_no')
        if not aadhaar:
            return JsonResponse({'status': 'error', 'message': 'UID is required'}, status=400)
            
        user, created = User.objects.update_or_create(
            aadhaar_no=aadhaar,
            defaults={
                'full_name': data.get('full_name', 'Unknown'),
                'dob': data.get('dob') or '1990-01-01',
                'gender': data.get('gender', 'Other'),
                'income': data.get('income', 0),
                'occupation': data.get('occupation', 'Unemployed'),
                'education': data.get('education', 'None'),
                'disability_status': bool(data.get('disability_status')),
                'pension_status': bool(data.get('pension_status')),
                'state': data.get('state', 'Tamil Nadu'),
                'district': data.get('district', 'Chennai'),
            }
        )
        
        return JsonResponse({
            'status': 'success', 
            'message': 'Profile updated successfully',
            'user_id': user.user_id
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def scan_schemes(request):
    try:
        data = json.loads(request.body)
        aadhaar = data.get('uid')
        if not aadhaar:
            return JsonResponse({'status': 'error', 'message': 'UID required'}, status=400)
            
        user = User.objects.filter(aadhaar_no=aadhaar).first()
        if not user:
            return JsonResponse({'status': 'error', 'message': 'User not found for this UID'}, status=404)
            
        # Trigger Eligibility Service
        EligibilityService.check_user_eligibility(user.user_id)
        
        # Fetch results
        eligibilities = UserEligibility.objects.filter(user=user, eligibility_status='Eligible')
        
        matched_schemes = []
        for e in eligibilities:
            # Create a mock confidence match percentage (e.g. 95%+)
            matched_schemes.append({
                'name': e.scheme.scheme_name,
                'amount': getattr(e.scheme, 'benefit_type', 'Variable Benefit') or 'Standard Output',
                'tag': 'High Confidence'
            })
            
        return JsonResponse({
            'status': 'success',
            'matched_schemes': matched_schemes,
            'total': len(matched_schemes)
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def voice_query(request):
    try:
        data = json.loads(request.body)
        text = data.get('text', '')
        
        extracted_data = NLPSchemeFinderService.extract_profile(text)
        
        return JsonResponse({
            'status': 'success',
            'extracted': extracted_data,
            'message': 'NLP Extracted Profile successfully.'
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@require_http_methods(["GET"])
def admin_metrics(request):
    try:
        metrics = AdminAnalyticsEngine.compute_metrics()
        
        # Format the scheme and category counts for JSON properly if they are QuerySets
        formatted_metrics = {
            'Total Users': metrics.get('Total Users', 0),
            'Total Applications': metrics.get('Total Applications', 0),
            'Approval Rate': metrics.get('Approval Rate', 0),
            'Rejection Rate': metrics.get('Rejection Rate', 0),
            'Active Grievances': metrics.get('Active Grievances', 0),
            'Welfare Heatmap': metrics.get('Scheme Wise Applications', []),
            'Income Brackets': metrics.get('Income Bracket Analysis', {})
        }
        
        return JsonResponse({'status': 'success', 'data': formatted_metrics})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@require_http_methods(["GET"])
def admin_grievances(request):
    try:
        from core.models import Grievance
        grievances = Grievance.objects.all().order_by('-raised_on')
        data = []
        for g in grievances:
            data.append({
                'id': f"GRV-{g.grievance_id:04d}",
                'raw_id': g.grievance_id,
                'complaint': g.complaint_text,
                'status': g.status,
                'raisedOn': g.raised_on.strftime('%Y-%m-%d %H:%M'),
                'user': g.user.full_name if g.user else 'Unknown'
            })
        return JsonResponse({'status': 'success', 'grievances': data})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def resolve_grievance(request, grievance_id):
    try:
        from django.utils import timezone
        from core.models import Grievance
        g = Grievance.objects.get(grievance_id=grievance_id)
        g.status = 'Resolved'
        g.resolved_on = timezone.now()
        g.save()
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
