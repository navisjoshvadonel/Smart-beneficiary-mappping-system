import google.generativeai as genai
from core.models import Scheme
import json

class GeminiBotService:
    _instance = None
    _chat_session = None

    @classmethod
    def get_instance(cls):
        if not cls._instance:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        from django.conf import settings
        # Use API Key from settings
        api_key = settings.GEMINI_API_KEY or "dummy_key"
        genai.configure(api_key=api_key)
        
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self._chat_session = self.model.start_chat(history=[])

    def get_dynamic_context(self, user_message):
        from .nlp_scheme_finder import NLPSchemeFinderService
        keywords = NLPSchemeFinderService.extract_profile(user_message)
        
        # Search schemes based on keywords
        query = Scheme.objects.all()
        if keywords.get('state') and keywords['state'] != 'All':
            query = query.filter(state__icontains=keywords['state'])
        if keywords.get('category') and keywords['category'] != 'General':
            query = query.filter(benefit_type__icontains=keywords['category'])
            
        schemes = query[:10] # Top 10 relevant
        if not schemes.exists():
            schemes = Scheme.objects.all()[:10]
            
        context_data = []
        for s in schemes:
            context_data.append(f"Scheme Name: {s.scheme_name}\nCategory: {s.benefit_type}\nState: {s.state}\nDescription: {s.description}")
        return "\n\n".join(context_data)

    def process_message(self, user_message, chat_history=[]):
        try:
            # Re-initialize chat with history if provided
            history_objs = []
            for msg in chat_history:
                history_objs.append({"role": msg["role"], "parts": [msg["content"]]})
            
            chat = self.model.start_chat(history=history_objs)
            
            # Inject dynamic context
            context = self.get_dynamic_context(user_message)
            prompt = (
                "You are an intelligent, reliable, and user-friendly assistant integrated into a government scheme and scholarship portal. "
                "Your role is to:\n"
                "- Help users search, filter, and apply for schemes quickly and accurately.\n"
                "- Provide clear, concise, and contextual explanations of scheme details.\n"
                "- Guide users step-by-step through application processes without errors.\n"
                "- Maintain a polite, professional, and supportive tone at all times.\n"
                "- Handle edge cases gracefully (e.g., missing data, invalid inputs).\n\n"
                "Core Behaviors:\n"
                "1. Always confirm user intent before taking action.\n"
                "2. Provide structured, well-organized responses (tables, lists).\n"
                "3. Use the provided context to answer accurately.\n"
                "4. If uncertain, ask clarifying questions.\n\n"
                f"Available Government Schemes Context:\n{context}\n\n"
                f"Citizen's Request: {user_message}"
            )
            
            response = chat.send_message(prompt)
            return response.text
        except Exception as e:
            print("Gemini API Error:", str(e))
            return "I apologize, but I am having trouble connecting to my knowledge base right now. Please try again in a moment."
