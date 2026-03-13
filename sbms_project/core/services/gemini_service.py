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
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self._chat_session = self.model.start_chat(history=[])

    def get_scheme_context(self):
        # Pull top 50 schemes to provide some DB awareness without hitting context limits
        schemes = Scheme.objects.all()[:50]
        context_data = []
        for s in schemes:
            context_data.append(f"Scheme Name: {s.scheme_name}\nCategory: {s.benefit_type}\nState: {s.state}\nDescription: {s.description}")
        return "\n\n".join(context_data)

    def process_message(self, user_message):
        try:
            # Inject context implicitly into the message block
            context = self.get_scheme_context()
            prompt = (
                "You are an intelligent, reliable, and user-friendly assistant integrated into a government scheme and scholarship portal. "
                "Your role is to:\n"
                "- Help users search, filter, and apply for schemes quickly and accurately.\n"
                "- Provide clear, concise, and contextual explanations of scheme details.\n"
                "- Guide users step-by-step through application processes without errors.\n"
                "- Maintain a polite, professional, and supportive tone at all times.\n"
                "- Handle edge cases gracefully (e.g., missing data, invalid inputs).\n"
                "- Never disclose internal system details or unsafe information.\n"
                "- Always prioritize accuracy, clarity, and user trust.\n\n"
                "Core Behaviors:\n"
                "1. Always confirm user intent before taking action.\n"
                "2. Provide structured, well-organized responses (tables, lists, step-by-step guides).\n"
                "3. Adapt explanations to the user's profile (e.g., state, income, education level).\n"
                "4. Respect accessibility needs (simple language, clear formatting).\n"
                "5. If uncertain, ask clarifying questions instead of guessing.\n"
                "6. End each interaction by guiding the user toward the next helpful step.\n\n"
                "Format your output using markdown for readability.\n\n"
                f"Available Government Schemes Context:\n{context}\n\n"
                f"Citizen's Request: {user_message}"
            )
            
            response = self._chat_session.send_message(prompt)
            return response.text
        except Exception as e:
            print("Gemini API Error:", str(e))
            return "I apologize, but I am having trouble connecting to my knowledge base right now. Please try again in a moment."
