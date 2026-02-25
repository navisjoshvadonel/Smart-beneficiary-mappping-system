from django.urls import path
from . import views
from . import views_auth
from . import views_citizen
from . import views_ai

urlpatterns = [
    path('profile/update/', views.update_profile, name='update_profile'),
    path('schemes/scan/', views.scan_schemes, name='scan_schemes'),
    path('admin/metrics/', views.admin_metrics, name='admin_metrics'),
    path('admin/grievances/', views.admin_grievances, name='admin_grievances'),
    path('admin/grievances/<int:grievance_id>/resolve/', views.resolve_grievance, name='resolve_grievance'),
    path('ai/chat/', views_ai.chat_with_gemini, name='chat_with_gemini'),
    
    # Auth Endpoints
    path('auth/register/', views_auth.register_user, name='register_user'),
    path('auth/login/', views_auth.login_user, name='login_user'),
    path('auth/google/', views_auth.google_auth, name='google_auth'),
    
    # Citizen Endpoints
    path('citizen/dashboard/<int:user_id>/', views_citizen.citizen_dashboard_data, name='citizen_dashboard'),
    path('citizen/applications/<int:user_id>/', views_citizen.citizen_applications, name='citizen_applications'),
    path('citizen/grievances/<int:user_id>/', views_citizen.citizen_grievances, name='citizen_grievances'),
    path('citizen/schemes/search/', views_citizen.search_schemes, name='search_schemes'),
    path('citizen/profile/<int:user_id>/', views_citizen.get_update_profile, name='get_update_profile'),
]
