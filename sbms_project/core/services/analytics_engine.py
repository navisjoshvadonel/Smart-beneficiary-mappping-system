from django.db.models import Count, Q
from core.models import User, Application, Grievance, Scheme, UserCategoryMapping

class AdminAnalyticsEngine:
    @classmethod
    def compute_metrics(cls):
        total_users = User.objects.count()
        total_applications = Application.objects.count()
        
        approved = Application.objects.filter(status='Approved').count()
        rejected = Application.objects.filter(status='Rejected').count()
        
        approval_rate = (approved / total_applications * 100) if total_applications > 0 else 0
        rejection_rate = (rejected / total_applications * 100) if total_applications > 0 else 0
        
        scheme_applications = list(Scheme.objects.annotate(app_count=Count('applications')).values('scheme_name', 'app_count'))
        
        category_beneficiaries = list(UserCategoryMapping.objects.values('category__category_name').annotate(count=Count('user')))

        gender_distribution = list(User.objects.values('gender').annotate(count=Count('user_id')))
        
        active_grievances = Grievance.objects.filter(status='Open').count()

        return {
            "Total Users": total_users,
            "Total Applications": total_applications,
            "Approval Rate": round(approval_rate, 2),
            "Rejection Rate": round(rejection_rate, 2),
            "Scheme Wise Applications": scheme_applications,
            "Category Wise Beneficiaries": category_beneficiaries,
            "Gender Distribution": gender_distribution,
            "Active Grievances": active_grievances,
            "Income Bracket Analysis": cls._compute_income_brackets()
        }

    @classmethod
    def _compute_income_brackets(cls):
        brackets = User.objects.aggregate(
            low_income=Count('user_id', filter=Q(income__lt=100000)),
            mid_income=Count('user_id', filter=Q(income__range=(100000, 500000))),
            high_income=Count('user_id', filter=Q(income__gt=500000))
        )
        return brackets
