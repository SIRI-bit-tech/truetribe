#!/usr/bin/env python
"""
Force register User model in admin
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truetribe_backend.settings')
django.setup()

from django.contrib import admin
from django.contrib.auth import get_user_model
from users.admin import CustomUserAdmin

User = get_user_model()

# Force register User model
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

admin.site.register(User, CustomUserAdmin)

print("✅ User model registered in admin")
print(f"User model: {User}")
print(f"Admin registered models: {list(admin.site._registry.keys())}")

# Check if User is in registry
if User in admin.site._registry:
    print("✅ User model is properly registered")
else:
    print("❌ User model registration failed")