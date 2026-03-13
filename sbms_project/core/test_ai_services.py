import google.generativeai as genai
from unittest.mock import MagicMock

# Global mocks
genai.configure = MagicMock()
genai.GenerativeModel = MagicMock()

from django.test import TestCase, Client
from unittest.mock import patch
from core.models import User, Scheme
from datetime import date, timedelta
from core.services.gemini_service import GeminiBotService
from core.services.ai_recommender import AIRecommenderService

class AIServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            user_id=1,
            full_name="AI Tester",
            dob=date.today() - timedelta(days=365*30),
            gender="Male",
            state="Tamil Nadu",
            income=60000
        )
        self.scheme = Scheme.objects.create(
            scheme_id=1,
            scheme_name="AI Test Scheme",
            state="Tamil Nadu",
            benefit_type="Education"
        )

    def test_gemini_bot_dynamic_context(self):
        mock_model_instance = genai.GenerativeModel.return_value
        mock_chat = MagicMock()
        mock_chat.send_message.return_value.text = "Hello! I found some schemes for you."
        mock_model_instance.start_chat.return_value = mock_chat
        
        # Reset singleton instance to force re-init with mocks if needed
        GeminiBotService._instance = None
        service = GeminiBotService.get_instance()
        reply = service.process_message("Show me education schemes in Tamil Nadu")
        
        self.assertEqual(reply, "Hello! I found some schemes for you.")

    def test_ai_recommender_logic(self):
        mock_model_instance = genai.GenerativeModel.return_value
        mock_response = MagicMock()
        mock_response.text = '```json\n[{"scheme_id": 1, "reason": "Matches your profile perfectly"}]\n```'
        mock_model_instance.generate_content.return_value = mock_response
        
        AIRecommenderService._instance = None
        recommender = AIRecommenderService.get_instance()
        recommendations = recommender.recommend_schemes(self.user.user_id)
        
        self.assertEqual(len(recommendations), 1)
        self.assertEqual(recommendations[0]['scheme_id'], 1)

    def test_chatbot_view_session(self):
        client = Client()
        with patch('core.services.gemini_service.GeminiBotService.process_message') as mock_process:
            mock_process.return_value = "Test Reply"
            
            # First message
            response = client.post('/api/ai/chat/', 
                                   data={'message': 'hello'}, 
                                   content_type='application/json')
            self.assertEqual(response.status_code, 200)
            self.assertIn('Test Reply', response.json()['reply'])
            
            # Check session
            self.assertEqual(len(client.session['bene_chat_history']), 2)
            
            # Clear history
            response = client.delete('/api/ai/chat/')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(client.session['bene_chat_history']), 0)
