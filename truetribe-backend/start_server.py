#!/usr/bin/env python
"""
TrueTribe Backend Server Startup Script
"""
import os
import sys
import subprocess

def run_command(command, description):
    print(f"\n🔄 {description}...")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Error: {result.stderr}")
        return False
    print(f"✅ {description} completed successfully")
    return True

def main():
    print("🚀 Starting TrueTribe Backend Server...")
    
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truetribe_backend.settings')
    
    # Run migrations
    if not run_command('python manage.py makemigrations', 'Creating migrations'):
        return
    
    if not run_command('python manage.py migrate', 'Running migrations'):
        return
    
    # Create superuser if it doesn't exist
    print("\n🔄 Creating superuser...")
    create_superuser_command = '''
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser("admin", "admin@truetribe.com", "admin123")
    print("Superuser created: admin / admin123")
else:
    print("Superuser already exists")
'''
    
    result = subprocess.run(
        f'python manage.py shell -c "{create_superuser_command}"',
        shell=True, capture_output=True, text=True
    )
    print(result.stdout)
    
    # Create sample data
    if not run_command('python manage_commands.py', 'Creating sample data'):
        print("⚠️  Sample data creation failed, but server can still run")
    
    # Collect static files
    if not run_command('python manage.py collectstatic --noinput', 'Collecting static files'):
        print("⚠️  Static files collection failed, but server can still run")
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Server Information:")
    print("   • Admin Panel: http://127.0.0.1:8000/admin/")
    print("   • API Base URL: http://127.0.0.1:8000/api/")
    print("   • Admin credentials: admin / admin123")
    print("   • Demo user credentials: demo / demo123")
    
    print("\n🔄 Starting development server...")
    os.system('python manage.py runserver 0.0.0.0:8000')

if __name__ == '__main__':
    main()