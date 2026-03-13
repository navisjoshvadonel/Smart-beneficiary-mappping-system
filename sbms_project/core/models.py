from django.db import models
from django.utils import timezone
from .services.encryption import AadhaarEncryptionService

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=255)
    dob = models.DateField()
    gender = models.CharField(max_length=50)
    email = models.EmailField(unique=True, null=True, blank=True)
    password = models.CharField(max_length=128, null=True, blank=True)  # Added for manual auth
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    ROLE_CHOICES = (
        ('Citizen', 'Citizen'),
        ('Staff', 'Staff'),
        ('Admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Citizen')
    aadhaar_no = models.CharField(max_length=500, unique=True)
    address = models.TextField()
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    income = models.DecimalField(max_digits=12, decimal_places=2)
    occupation = models.CharField(max_length=100)
    education = models.CharField(max_length=100)
    disability_status = models.BooleanField(default=False)
    pension_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.aadhaar_no and not self.aadhaar_no.startswith('gAAAAA'):
            self.aadhaar_no = AadhaarEncryptionService.encrypt(self.aadhaar_no)
        super().save(*args, **kwargs)

    @property
    def decrypted_aadhaar(self):
        return AadhaarEncryptionService.decrypt(self.aadhaar_no)

    class Meta:
        db_table = 'users'

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'categories'

class UserCategoryMapping(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='categories')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_column='category_id')
    mapped_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_category_mapping'

class Scheme(models.Model):
    scheme_id = models.AutoField(primary_key=True)
    scheme_name = models.CharField(max_length=500)
    description = models.TextField(null=True, blank=True)
    benefit_type = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=100)
    official_link = models.URLField(max_length=1000, null=True, blank=True)
    registration_link = models.URLField(max_length=1000, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'schemes'

class RuleEngine(models.Model):
    rule_id = models.AutoField(primary_key=True)
    scheme = models.ForeignKey(Scheme, on_delete=models.CASCADE, db_column='scheme_id', related_name='rules')
    min_age = models.IntegerField(null=True, blank=True)
    max_age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=50, null=True, blank=True)
    min_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    max_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    required_education = models.CharField(max_length=100, null=True, blank=True)
    disability_required = models.BooleanField(null=True, blank=True)
    pension_required = models.BooleanField(null=True, blank=True)
    occupation_required = models.CharField(max_length=100, null=True, blank=True)
    business_turnover_limit = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    state_required = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
        db_table = 'rule_engine'

class UserEligibility(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='eligibilities')
    scheme = models.ForeignKey(Scheme, on_delete=models.CASCADE, db_column='scheme_id')
    eligibility_status = models.CharField(max_length=100)
    reason = models.TextField(null=True, blank=True)
    calculated_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_eligibility'
        indexes = [
            models.Index(fields=['user', 'scheme']),
        ]

class Application(models.Model):
    application_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='applications')
    scheme = models.ForeignKey(Scheme, on_delete=models.CASCADE, db_column='scheme_id')
    status = models.CharField(max_length=100, default='Pending')
    remarks = models.TextField(null=True, blank=True)
    applied_on = models.DateTimeField(auto_now_add=True)
    decision_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'applications'

class Grievance(models.Model):
    grievance_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='grievances')
    scheme = models.ForeignKey(Scheme, on_delete=models.CASCADE, db_column='scheme_id', null=True, blank=True)
    complaint_text = models.TextField()
    status = models.CharField(max_length=100, default='Open')
    admin_remark = models.TextField(null=True, blank=True)
    # New AI-driven fields
    sentiment = models.CharField(max_length=50, null=True, blank=True, default='Neutral')
    urgency = models.CharField(max_length=50, null=True, blank=True, default='Medium')
    issue_category = models.CharField(max_length=100, null=True, blank=True)
    
    raised_on = models.DateTimeField(auto_now_add=True)
    resolved_on = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'grievances'
