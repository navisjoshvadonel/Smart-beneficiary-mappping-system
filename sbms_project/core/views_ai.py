import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .services.gemini_service import GeminiBotService

@csrf_exempt
@require_http_methods(["POST"])
def chat_with_gemini(request):
    try:
        body = json.loads(request.body)
        message = body.get('message', '')
        
        if not message:
            return JsonResponse({'status': 'error', 'message': 'Empty query'}, status=400)

        # Connect to gemini
        gemini = GeminiBotService.get_instance()
        reply = gemini.process_message(message)

        return JsonResponse({'status': 'success', 'reply': reply})
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
