import re
import logging
from core.services.eligibility_service import EligibilityService

logger = logging.getLogger(__name__)

class NLPSchemeFinderService:
    """
    Mock NLP Service using regex keyword extraction.
    In production, this would use a proper LLM or NLP framework like spaCy.
    """
    @classmethod
    def find_schemes_for_text(cls, text, mock_user_id=None):
        extracted_data = cls.extract_profile(text)
        logger.info(f"NLP Extracted Data: {extracted_data}")
        
        if mock_user_id:
            logger.info("Triggering Eligibility Engine for mapped user...")
            EligibilityService.check_user_eligibility(mock_user_id)
            
        return extracted_data

    @classmethod
    def extract_profile(cls, text):
        text_lower = text.lower()
        
        extracted = {
            'gender': cls._extract_gender(text_lower),
            'income_range': cls._extract_income(text_lower),
            'occupation': cls._extract_occupation(text_lower),
            'state': cls._extract_state(text),
            'category': cls._extract_category(text_lower),
        }
        return extracted

    @classmethod
    def _extract_gender(cls, text):
        # English, Hindi, and Tamil keywords
        if re.search(r'\b(woman|female|girl|mahila|stree|pen|pengal)\b', text):
            return 'Female'
        elif re.search(r'\b(man|male|boy|purush|aadmi|aan|aangal)\b', text):
            return 'Male'
        return 'Any'

    @classmethod
    def _extract_income(cls, text):
        if re.search(r'\b(low income|poor|bpl|below poverty)\b', text):
            return 'Low'
        elif re.search(r'\b(middle income|middle class)\b', text):
            return 'Middle'
        return 'Any'

    @classmethod
    def _extract_occupation(cls, text):
        if re.search(r'\b(unemployed|no job)\b', text):
            return 'Unemployed'
        elif re.search(r'\b(farmer|agriculture)\b', text):
            return 'Farmer'
        elif re.search(r'\b(student)\b', text):
            return 'Student'
        return 'Any'

    @classmethod
    def _extract_state(cls, text):
        if re.search(r'(Tamil Nadu|TN)', text, re.IGNORECASE):
            return 'Tamil Nadu'
        return 'All'

    @classmethod
    def _extract_category(cls, text):
        if re.search(r'\b(sc|st|dalit)\b', text):
            return 'SC/ST'
        elif re.search(r'\b(obc|bc|backward)\b', text):
            return 'OBC'
        elif re.search(r'\b(minority|muslim|christian)\b', text):
            return 'Minority'
        return 'General'
