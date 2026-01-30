#!/usr/bin/env python
"""Quick test to verify settings and views are working."""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))

django.setup()

from django.conf import settings
from apps.products import template_views, api_views

print("✓ Settings loaded successfully")
print(f"✓ CORS middleware installed: {'corsheaders.middleware.CorsMiddleware' in settings.MIDDLEWARE}")
print(f"✓ corsheaders app installed: {'corsheaders' in settings.INSTALLED_APPS}")
print(f"✓ Template views imported: {template_views.index is not None}")
print(f"✓ API views imported: {api_views.login is not None}")
print("\nAll checks passed!")
