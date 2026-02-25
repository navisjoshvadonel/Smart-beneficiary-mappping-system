from core.models import Application, UserEligibility
from django.utils import timezone

class ApplicationProcessingModule:
    @classmethod
    def apply_for_scheme(cls, user, scheme, remarks=""):
        eligibility = UserEligibility.objects.filter(user=user, scheme=scheme).first()
        if not eligibility or eligibility.eligibility_status != 'Eligible':
            return False, "User not eligible or eligibility not checked."
        
        application, created = Application.objects.get_or_create(
            user=user,
            scheme=scheme,
            defaults={'remarks': remarks}
        )
        if not created:
            return False, "Application already exists."
        return True, "Application submitted successfully."

    @classmethod
    def process_application(cls, application_id, status, remarks=""):
        try:
            application = Application.objects.get(application_id=application_id)
            application.status = status
            application.remarks = remarks
            application.decision_date = timezone.now()
            application.save()
            return True, f"Application {status}"
        except Application.DoesNotExist:
            return False, "Application not found"
