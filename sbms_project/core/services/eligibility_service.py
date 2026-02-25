from datetime import date
from django.db import transaction
from django.conf import settings
from core.models import User, Scheme, RuleEngine, UserEligibility
import logging

logger = logging.getLogger(__name__)

class EligibilityService:
    @classmethod
    def calculate_age(cls, dob):
        if not dob:
            return 0
        today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    @classmethod
    def check_user_eligibility(cls, user_id):
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found.")
            return False

        default_state = getattr(settings, 'DEFAULT_STATE', 'Tamil Nadu')

        # 2. Fetch schemes where state == Tamil Nadu OR state == All
        schemes = Scheme.objects.filter(state__in=[default_state, 'All'])

        age = cls.calculate_age(user.dob)
        
        results = []

        with transaction.atomic():
            # Clear old eligibilities for this user to recalculate
            UserEligibility.objects.filter(user=user).delete()

            for scheme in schemes:
                rules = RuleEngine.objects.filter(scheme=scheme)
                
                if not rules.exists():
                    results.append(cls._mark_eligibility(user, scheme, "Eligible", "No strict rules defined"))
                    continue

                for rule in rules:
                    is_eligible, reason = cls._evaluate_rule(user, age, rule)
                    
                    status = "Eligible" if is_eligible else "Not Eligible"
                    results.append(cls._mark_eligibility(user, scheme, status, reason))
                    
                    # We evaluate rules and mark eligibility. We evaluate the first rule strictly as requested.
                    break 

        return results

    @classmethod
    def _evaluate_rule(cls, user, age, rule):
        if rule.min_age is not None and age < rule.min_age:
            return False, f"Age {age} below minimum {rule.min_age}"
        if rule.max_age is not None and age > rule.max_age:
            return False, f"Age {age} above maximum {rule.max_age}"
        if rule.gender and rule.gender.lower() != 'any' and user.gender.lower() != rule.gender.lower():
            return False, "Gender mismatch"
        if rule.min_income is not None and user.income < rule.min_income:
            return False, "Income below minimum"
        if rule.max_income is not None and user.income > rule.max_income:
            return False, "Income above maximum"
        if rule.required_education and user.education.strip().lower() != rule.required_education.strip().lower():
            return False, "Education mismatched"
        if rule.disability_required is not None and rule.disability_required and not user.disability_status:
            return False, "Disability required"
        if rule.pension_required is not None and rule.pension_required and not user.pension_status:
            return False, "Pension required"
        if rule.occupation_required and user.occupation.strip().lower() != rule.occupation_required.strip().lower():
            return False, "Occupation mismatched"
        if rule.state_required and rule.state_required.lower() != 'all' and user.state.lower() != rule.state_required.lower():
            return False, "State mismatched"
        
        return True, "All conditions satisfied"

    @classmethod
    def _mark_eligibility(cls, user, scheme, status, reason):
        return UserEligibility.objects.create(
            user=user,
            scheme=scheme,
            eligibility_status=status,
            reason=reason
        )
