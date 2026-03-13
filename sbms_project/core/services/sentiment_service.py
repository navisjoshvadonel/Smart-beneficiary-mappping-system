import google.generativeai as genai
import json
import logging

logger = logging.getLogger(__name__)

class SentimentService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if not cls._instance:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        # Using the existing key from the codebase
        genai.configure(api_key="AIzaSyCSqxdFD2wDdUYfJbJxdAvsJmSnsvj4n6M")
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze_grievance(self, text):
        try:
            prompt = (
                "Analyze the following grievance text from a citizen in a government scheme portal.\n"
                "Provide a JSON response with the following keys:\n"
                "- 'sentiment': 'Positive', 'Neutral', 'Negative', or 'Hostile'\n"
                "- 'urgency': 'Low', 'Medium', 'High', or 'Critical'\n"
                "- 'category': 'Delay', 'Corruption', 'Technical Issue', 'Eligibility Issue', or 'Other'\n"
                "- 'summary': A one-sentence summary of the issue.\n\n"
                f"Text: {text}"
            )
            
            response = self.model.generate_content(prompt)
            # Find JSON in response
            content = response.text
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end != -1:
                return json.loads(content[start:end])
            return {
                'sentiment': 'Neutral',
                'urgency': 'Medium',
                'category': 'Other',
                'summary': 'Could not analyze sentiment.'
            }
        except Exception as e:
            logger.error(f"Sentiment Analysis Error: {str(e)}")
            return {
                'sentiment': 'Unknown',
                'urgency': 'Unknown',
                'category': 'Unknown',
                'summary': 'Error in analysis.'
            }
