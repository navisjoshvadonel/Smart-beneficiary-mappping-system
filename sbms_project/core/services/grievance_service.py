from core.models import Grievance
from django.utils import timezone

class GrievanceModule:
    @classmethod
    def lodge_grievance(cls, user, scheme, text):
        return Grievance.objects.create(
            user=user,
            scheme=scheme,
            complaint_text=text
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
