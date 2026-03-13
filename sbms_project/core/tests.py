from django.test import TestCase
from datetime import date, timedelta
from core.models import User, Scheme, RuleEngine, UserEligibility
from core.services.eligibility_service import EligibilityService

class EligibilityTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create(
            full_name="Tester",
            dob=date.today() - timedelta(days=365*25), # 25 years old
            gender="Female",
            income=50000,
            occupation="Farmer",
            education="Master",
            aadhaar_no="123456789012",
            state="Tamil Nadu",
            district="Chennai",
            address="Test Street"
        )
        # Create a test scheme
        self.scheme = Scheme.objects.create(
            scheme_name="Test Welfare",
            state="Tamil Nadu",
            benefit_type="Financial"
        )
        # Create a rule
        RuleEngine.objects.create(
            scheme=self.scheme,
            min_age=18,
            max_age=60,
            gender="Female",
            max_income=100000
        )

    def test_eligible_user(self):
        results = EligibilityService.check_user_eligibility(self.user.user_id)
        eligibility = UserEligibility.objects.get(user=self.user, scheme=self.scheme)
        self.assertEqual(eligibility.eligibility_status, "Eligible")

    def test_ineligible_age(self):
        # Make user older than 60
        self.user.dob = date.today() - timedelta(days=365*65)
        self.user.save()
        EligibilityService.check_user_eligibility(self.user.user_id)
        eligibility = UserEligibility.objects.get(user=self.user, scheme=self.scheme)
        self.assertEqual(eligibility.eligibility_status, "Not Eligible")
        self.assertIn("above maximum", eligibility.reason)

    def test_ineligible_gender(self):
        # Change gender to Male
        self.user.gender = "Male"
        self.user.save()
        EligibilityService.check_user_eligibility(self.user.user_id)
        eligibility = UserEligibility.objects.get(user=self.user, scheme=self.scheme)
        self.assertEqual(eligibility.eligibility_status, "Not Eligible")
        self.assertEqual(eligibility.reason, "Gender mismatch")
