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
        genai.configure(api_key="AIzaSyCSqxdFD2wDdUYfJbJxdAvsJmSnsvj4n6M")
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

            user_profile = {
                'age': 25, # Simplified for now, should calculate from dob
                'gender': user.gender,
                'state': user.state,
                'income': str(user.income),
                'occupation': user.occupation,
                'education': user.education,
                'disability': user.disability_status
            }

            prompt = (
                f"User Profile: {json.dumps(user_profile)}\n"
                f"User Query: {chat_query if chat_query else 'Find best schemes for me'}\n"
                f"Available Schemes: {json.dumps(scheme_list)}\n\n"
                "Task: Return a JSON list of top 3 recommended scheme IDs and a short 'reason' for each.\n"
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
