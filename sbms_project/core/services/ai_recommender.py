import google.generativeai as genai
import json
import logging
from core.models import Scheme, User

logger = logging.getLogger(__name__)

class AIRecommenderService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if not cls._instance:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        from django.conf import settings
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def recommend_schemes(self, user_id, chat_query=None):
        try:
            user = User.objects.get(user_id=user_id)
            all_schemes = Scheme.objects.all()
            
            scheme_list = []
            for s in all_schemes:
                scheme_list.append({
                    'id': s.scheme_id,
                    'name': s.scheme_name,
                    'benefit': s.benefit_type,
                    'state': s.state,
                    'desc': s.description[:200]
                })

            # Calculate age dynamically
            from datetime import date
            age = 0
            if user.dob:
                today = date.today()
                age = today.year - user.dob.year - ((today.month, today.day) < (user.dob.month, user.dob.day))

            user_profile = {
                'age': age,
                'gender': user.gender,
                'state': user.state,
                'income': str(user.income),
                'occupation': user.occupation,
                'education': user.education,
                'disability': user.disability_status
            }

            prompt = (
                f"User Profile: {json.dumps(user_profile)}\n"
                f"User Requested Needs: {chat_query if chat_query else 'Find best schemes for me'}\n"
                f"Available Schemes: {json.dumps(scheme_list)}\n\n"
                "Task: Return a JSON list of top 3 recommended scheme IDs and a short 'reason' for each.\n"
                "STRICT CONSTRAINT: Only recommend schemes where the user's state matches the scheme's state (or 'All India') and the income is within logical bounds.\n"
                "Format: [{\"scheme_id\": 1, \"reason\": \"Because...\"}, ...]"
            )
            
            response = self.model.generate_content(prompt)
            content = response.text
            start = content.find('[')
            end = content.rfind(']') + 1
            if start != -1 and end != -1:
                recommendations = json.loads(content[start:end])
                return recommendations
            return []
        except Exception as e:
            logger.error(f"AI Recommender Error: {str(e)}")
            return []
