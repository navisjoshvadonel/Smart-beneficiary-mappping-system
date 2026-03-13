import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .services.gemini_service import GeminiBotService

@csrf_exempt
@require_http_methods(["POST", "DELETE"])
def chat_with_gemini(request):
    if request.method == "DELETE":
        request.session['bene_chat_history'] = []
        return JsonResponse({'status': 'success', 'message': 'Chat history cleared'})

    try:
        body = json.loads(request.body)
        message = body.get('message', '')
        
        if not message:
            return JsonResponse({'status': 'error', 'message': 'Empty query'}, status=400)

        # Get history from session
        history = request.session.get('bene_chat_history', [])

        # Connect to gemini
        gemini = GeminiBotService.get_instance()
        reply = gemini.process_message(message, history)

        # Update history
        history.append({"role": "user", "content": message})
        history.append({"role": "model", "content": reply})
        request.session['bene_chat_history'] = history

        return JsonResponse({'status': 'success', 'reply': reply})
        
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
