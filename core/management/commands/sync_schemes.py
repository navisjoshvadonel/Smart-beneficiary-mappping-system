"""Synchronise schemes from approved, machine-readable official feeds.

Usage:
    python manage.py sync_schemes --url https://example.gov.in/schemes.json

The production scheduler should run this command daily with URLs supplied in
SCHEME_FEED_URLS (comma-separated). It never deletes rows and never disables
records when a feed is empty or malformed.
"""
import csv
import hashlib
import io
import json
import os
from datetime import datetime

import requests
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from core.models import Category, Scheme


def _records(payload):
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ('schemes', 'results', 'data', 'items'):
            if isinstance(payload.get(key), list):
                return payload[key]
    raise ValueError('Feed must contain a list or a schemes/results/data/items list')


def _parse_datetime(value):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace('Z', '+00:00'))
        return timezone.make_aware(parsed) if timezone.is_naive(parsed) else parsed
    except (TypeError, ValueError):
        return None


def _text(value):
    if value is None:
        return ''
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value).strip()


def _normalise(record, source_name, source_url):
    name = _text(record.get('scheme_name') or record.get('name') or record.get('title'))
    link = _text(record.get('official_link') or record.get('url') or record.get('link'))
    if not name or not link:
        return None
    source_record_id = _text(record.get('id') or record.get('scheme_id') or name)
    return {
        'scheme_name': name[:255],
        'description': _text(record.get('description') or record.get('summary')),
        'benefits': _text(record.get('benefits') or record.get('benefit')),
        'official_link': link[:500],
        'registration_link': _text(record.get('registration_link') or record.get('apply_url'))[:500],
        'benefit_type': _text(record.get('benefit_type') or record.get('type'))[:100],
        'state': _text(record.get('state') or record.get('location') or 'All India')[:100],
        'category': _text(record.get('category') or record.get('target_category') or 'General Welfare'),
        'source_id': f'{source_url}#{source_record_id}',
        'source_name': source_name[:100],
        'source_url': source_url[:500],
        'source_updated_at': _parse_datetime(record.get('updated_at') or record.get('last_updated')),
    }


def parse_feed(content, content_type=''):
    try:
        decoded = content.decode('utf-8-sig')
    except UnicodeDecodeError as exc:
        raise ValueError('Feed is not valid UTF-8') from exc
    if 'csv' in content_type.lower() or decoded.lstrip().startswith('scheme_name,'):
        return list(csv.DictReader(io.StringIO(decoded)))
    try:
        return _records(json.loads(decoded))
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError):
        raise ValueError('Only JSON and CSV feeds are supported; expose an official API/export for ingestion')


class Command(BaseCommand):
    help = 'Synchronise government schemes from approved official JSON or CSV feeds.'

    def add_arguments(self, parser):
        parser.add_argument('--url', action='append', dest='urls', help='Official JSON/CSV feed URL; repeatable')
        parser.add_argument('--source-name', default='Official government feed')
        parser.add_argument('--timeout', type=int, default=20)

    def handle(self, *args, **options):
        urls = options.get('urls') or [u.strip() for u in os.getenv('SCHEME_FEED_URLS', '').split(',') if u.strip()]
        if not urls:
            raise CommandError('Provide --url or set SCHEME_FEED_URLS to approved official feed URLs.')

        total = 0
        for url in urls:
            total += self.sync_url(url, options['source_name'], options['timeout'])
        self.stdout.write(self.style.SUCCESS(f'Synchronised {total} schemes from {len(urls)} feed(s).'))

    def sync_url(self, url, source_name, timeout):
        response = requests.get(url, headers={'Accept': 'application/json, text/csv'}, timeout=timeout)
        response.raise_for_status()
        records = parse_feed(response.content, response.headers.get('Content-Type', ''))
        if not records:
            raise CommandError(f'{url} returned no records; existing data was left untouched.')

        now = timezone.now()
        seen = set()
        written = 0
        with transaction.atomic():
            for raw in records:
                item = _normalise(raw, source_name, url)
                if not item or item['source_id'] in seen:
                    continue
                seen.add(item['source_id'])
                category = Category.objects.filter(category_name__iexact=item.pop('category')).first()
                if category is None:
                    category = Category.objects.order_by('category_id').first()
                if category is None:
                    raise CommandError('No categories exist; load categories before syncing schemes.')
                canonical = json.dumps(item, sort_keys=True, default=str)
                item['content_hash'] = hashlib.sha256(canonical.encode('utf-8')).hexdigest()
                item['target_category'] = category
                item['last_verified_at'] = now
                Scheme.objects.update_or_create(
                    source_id=item['source_id'],
                    defaults={**item, 'is_active': True},
                )
                written += 1
            if not written:
                raise CommandError(f'{url} contained no valid scheme records; existing data was left untouched.')
            Scheme.objects.filter(source_url=url).exclude(source_id__in=seen).update(is_active=False)
        self.stdout.write(f'{url}: {written} records accepted.')
        return written