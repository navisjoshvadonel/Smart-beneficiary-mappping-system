import time
import logging

logger = logging.getLogger(__name__)

class APILoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        # Pre-process
        # Sanitize passwords from logging
        payload = "(hidden)" if "password" in request.body.decode('utf-8', 'ignore') else request.body.decode('utf-8', 'ignore')

        response = self.get_response(request)

        # Post-process
        duration = time.time() - start_time
        
        # Log the request details
        log_data = (
            f"Method: {request.method} | "
            f"Path: {request.path} | "
            f"Status: {response.status_code} | "
            f"Execution Time: {duration:.3f}s | "
            f"Payload: {payload[:200]}" # Limit payload log size
        )
        
        logger.info(log_data)
        
        return response
