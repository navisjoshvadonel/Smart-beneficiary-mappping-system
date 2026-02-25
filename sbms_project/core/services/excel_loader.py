import pandas as pd
import numpy as np
from django.db import transaction
from django.conf import settings
from core.models import Scheme, RuleEngine, Category
import logging

logger = logging.getLogger(__name__)

class ExcelDataLoaderService:
    @classmethod
    def load_data(cls):
        file_path = getattr(settings, 'EXCEL_DATASET_PATH', None)
        if not file_path:
            logger.error("EXCEL_DATASET_PATH not configured.")
            return

        try:
            xls = pd.ExcelFile(file_path, engine='openpyxl')
        except Exception as e:
            logger.error(f"Failed to load excel file: {e}")
            return

        try:
            with transaction.atomic():
                cls._load_categories(xls)
                cls._load_schemes(xls)
                cls._load_rules(xls)
            logger.info("Excel ingestion successful.")
        except Exception as e:
            logger.error(f"Excel ingestion failed: {e}")
            raise e

    @classmethod
    def _clean_val(cls, val):
        if pd.isna(val) or val == 'NaN':
            return None
        return val

    @classmethod
    def _load_categories(cls, xls):
        if 'Categories Sheet' in xls.sheet_names:
            df = pd.read_excel(xls, 'Categories Sheet')
            for _, row in df.iterrows():
                cat_name = cls._clean_val(row.get('Category Name'))
                if cat_name:
                    Category.objects.get_or_create(
                        category_name=cat_name,
                        defaults={'description': cls._clean_val(row.get('Description')) or ''}
                    )

    @classmethod
    def _load_schemes(cls, xls):
        if 'Scheme Metadata Sheet' in xls.sheet_names:
            df = pd.read_excel(xls, 'Scheme Metadata Sheet')
            for _, row in df.iterrows():
                scheme_name = cls._clean_val(row.get('Scheme Name'))
                if scheme_name:
                    Scheme.objects.get_or_create(
                        scheme_name=scheme_name,
                        defaults={
                            'description': cls._clean_val(row.get('Description')) or '',
                            'benefit_type': cls._clean_val(row.get('Benefit Type')),
                            'state': cls._clean_val(row.get('State')) or 'All',
                            'official_link': cls._clean_val(row.get('Official Link')),
                            'registration_link': cls._clean_val(row.get('Registration Link')),
                        }
                    )

    @classmethod
    def _load_rules(cls, xls):
        if 'Eligibility Rules Sheet' in xls.sheet_names:
            df = pd.read_excel(xls, 'Eligibility Rules Sheet')
            for _, row in df.iterrows():
                scheme_name = cls._clean_val(row.get('Scheme Name'))
                if not scheme_name:
                    continue
                scheme = Scheme.objects.filter(scheme_name=scheme_name).first()
                if not scheme:
                    continue
                
                RuleEngine.objects.get_or_create(
                    scheme=scheme,
                    defaults={
                        'min_age': pd.to_numeric(cls._clean_val(row.get('Min Age')), errors='coerce'),
                        'max_age': pd.to_numeric(cls._clean_val(row.get('Max Age')), errors='coerce'),
                        'gender': cls._clean_val(row.get('Gender')) or 'Any',
                        'min_income': pd.to_numeric(cls._clean_val(row.get('Min Income')), errors='coerce'),
                        'max_income': pd.to_numeric(cls._clean_val(row.get('Max Income')), errors='coerce'),
                        'required_education': cls._clean_val(row.get('Education')),
                        'disability_required': bool(cls._clean_val(row.get('Disability Required'))),
                        'pension_required': bool(cls._clean_val(row.get('Pension Required'))),
                        'occupation_required': cls._clean_val(row.get('Occupation')),
                        'business_turnover_limit': pd.to_numeric(cls._clean_val(row.get('Turnover Limit')), errors='coerce'),
                        'state_required': cls._clean_val(row.get('State Required'))
                    }
                )
