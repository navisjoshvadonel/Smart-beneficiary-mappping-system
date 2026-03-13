from core.models import Grievance
from django.utils import timezone

class GrievanceModule:
    @classmethod
    def lodge_grievance(cls, user, scheme, text):
        from .sentiment_service import SentimentService
        
        # Analyze sentiment using AI
        analysis = SentimentService.get_instance().analyze_grievance(text)
        
        return Grievance.objects.create(
            user=user,
            scheme=scheme,
            complaint_text=text,
            sentiment=analysis.get('sentiment', 'Neutral'),
            urgency=analysis.get('urgency', 'Medium'),
            issue_category=analysis.get('category', 'Other')
        )

    @classmethod
    def resolve_grievance(cls, grievance_id, admin_remark):
        try:
            grievance = Grievance.objects.get(grievance_id=grievance_id)
            grievance.status = 'Resolved'
            grievance.admin_remark = admin_remark
            grievance.resolved_on = timezone.now()
            grievance.save()
            return True, "Grievance resolved."
        except Grievance.DoesNotExist:
            return False, "Grievance not found."
