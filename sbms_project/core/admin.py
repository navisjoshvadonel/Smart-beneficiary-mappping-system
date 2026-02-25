from django.contrib import admin
from .models import User, Category, UserCategoryMapping, Scheme, RuleEngine, UserEligibility, Application, Grievance

admin.site.register(User)
admin.site.register(Category)
admin.site.register(UserCategoryMapping)
admin.site.register(Scheme)
admin.site.register(RuleEngine)
admin.site.register(UserEligibility)
admin.site.register(Application)
admin.site.register(Grievance)

