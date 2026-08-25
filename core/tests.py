import json
from datetime import date
from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase, SimpleTestCase

from . import views
from .forms import LoginForm, UserRegistrationForm
from .management.commands.sync_schemes import parse_feed


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


class SchemeFeedTests(SimpleTestCase):
    def test_json_feed_accepts_common_scheme_envelope(self):
        records = parse_feed(b'{"schemes": [{"id": "pm-1", "name": "Example", "url": "https://example.gov.in"}]}', 'application/json')
        self.assertEqual(records[0]['name'], 'Example')

    def test_empty_feed_is_represented_as_empty_records(self):
        self.assertEqual(parse_feed(b'{"results": []}', 'application/json'), [])

    def test_unsupported_html_feed_is_rejected(self):
        with self.assertRaises(ValueError):
            parse_feed(b'<html>schemes</html>', 'text/html')


class EligibilityTests(SimpleTestCase):
    def test_match_score_includes_location_and_disability(self):
        user = SimpleNamespace(
            dob=date(1990, 1, 1),
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

    def test_match_score_handles_missing_user_dob(self):
        user = SimpleNamespace(dob=None)
        score = views._calculate_match_score(user, SimpleNamespace())
        self.assertEqual(score, 75)


class PermissionAndWorkflowTests(RequestTestCase):
    def test_document_checklist_requires_post(self):
        user = SimpleNamespace(is_authenticated=True, id=7)
        response = views.document_checklist(self.request('get', user=user), 1)
        self.assertEqual(response.status_code, 405)

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

    @patch.object(views.messages, 'error')
    def test_admin_delete_user_prevents_self_deletion(self, error):
        user = SimpleNamespace(is_authenticated=True, is_active=True, is_staff=True, email='admin@example.com', username='admin@example.com')
        custom_user = SimpleNamespace(user_id=1, email='admin@example.com')

        req = self.request('post', user=user)
        req.POST = {}
        with patch.object(views.CustomUser.objects, 'get', return_value=custom_user):
            response = views.admin_delete_user(req, 1)

        self.assertEqual(response.status_code, 302)
        error.assert_called_once()


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
