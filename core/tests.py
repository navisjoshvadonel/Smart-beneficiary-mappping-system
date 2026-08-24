import json
from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, SimpleTestCase

from . import views
from .forms import LoginForm, UserRegistrationForm


class RequestTestCase(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def request(self, method='get', path='/', user=None, body=None):
        factory_method = getattr(self.factory, method.lower())
        if body:
            request = factory_method(path, data=body, content_type='application/json')
        else:
            request = factory_method(path)
        request.user = user or AnonymousUser()
        request.session = {}
        return request


class AuthenticationTests(SimpleTestCase):
    def test_registration_rejects_invalid_aadhaar(self):
        form = UserRegistrationForm(data={'aadhaar_no': '123'})
        self.assertFalse(form.is_valid())
        self.assertIn('aadhaar_no', form.errors)

    def test_login_form_uses_email_label(self):
        self.assertEqual(LoginForm().fields['username'].label, 'Email')


class EligibilityTests(SimpleTestCase):
    def test_match_score_includes_location_and_disability(self):
        user = SimpleNamespace(
            dob=__import__('datetime').date(1990, 1, 1),
            gender='Female', income=50000, address='Pune',
            disability_cert=True, pension_status=False,
            unemployment_status=False, education='Graduate',
            occupation='Teacher',
        )
        rule = SimpleNamespace(
            age_min=18, age_max=60, gender='Female', min_income=10000,
            max_income=100000, location='Pune', disability_cert=True,
            pension_status=None, unemployment_status=None,
            education_required='Graduate', business_turnover_limit=None,
        )
        manager = Mock()
        manager.filter.return_value = Mock(exists=Mock(return_value=True), __iter__=Mock(return_value=iter([rule])))
        with patch.object(views.RuleEngine, 'objects', manager):
            score = views._calculate_match_score(user, SimpleNamespace())
        self.assertEqual(score, 100)


class PermissionAndWorkflowTests(RequestTestCase):
    def test_admin_users_redirects_anonymous_users(self):
        response = views.admin_users(self.request())
        self.assertEqual(response.status_code, 302)

    @patch.object(views.messages, 'error')
    def test_application_requires_eligibility(self, error):
        user = SimpleNamespace(is_authenticated=True, is_staff=False, is_superuser=False, id=7)
        custom_user = SimpleNamespace(user_id=10)
        eligibility = Mock(exists=Mock(return_value=False))
        with patch.object(views, 'get_custom_user', return_value=custom_user), \
               patch.object(views, 'get_object_or_404', return_value=SimpleNamespace()), \
             patch.object(views.UserEligibility.objects, 'filter', return_value=eligibility):
            response = views.apply_scheme(self.request('post', user=user), 1)
        self.assertEqual(response.status_code, 302)
        error.assert_called_once()

    def test_ai_rejects_oversized_input(self):
        user = SimpleNamespace(is_authenticated=True, id=7)
        request = self.request('post', user=user, body={'message': 'x' * 2001})
        response = views.ai_chat(request)
        self.assertEqual(response.status_code, 400)

    def test_ai_provider_failure_is_not_exposed(self):
        user = SimpleNamespace(is_authenticated=True, id=7)
        request = self.request('post', user=user, body={'message': 'hello'})
        with patch.object(views.settings, 'GROQ_API_KEY', 'test-key'), \
             patch.object(views, 'get_custom_user', return_value=None), \
             patch('requests.post', side_effect=RuntimeError('provider secret')):
            response = views.ai_chat(request)
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('provider secret', response.content.decode())


class OTPTests(RequestTestCase):
    @patch.object(views.messages, 'error')
    def test_expired_otp_is_rejected(self, error):
        request = self.request('post', body={'otp': '123456'})
        request.POST = {'otp': '123456'}
        request.session.update({
            'otp_code': '123456',
            'otp_email': 'person@example.com',
            'otp_attempts': 0,
            'otp_created_at': 0,
        })
        response = views.verify_otp(request)
        self.assertEqual(response.status_code, 302)
        self.assertNotIn('otp_code', request.session)
        error.assert_called_once()
