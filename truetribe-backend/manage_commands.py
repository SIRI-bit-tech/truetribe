#!/usr/bin/env python
"""
Management commands for TrueTribe backend
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truetribe_backend.settings')
    django.setup()
    
    from django.contrib.auth import get_user_model
    from users.models import Follow
    from posts.models import Post
    from trust_system.models import TrustScore
    
    User = get_user_model()
    
    # Create sample users
    if not User.objects.filter(username='demo').exists():
        demo_user = User.objects.create_user(
            username='demo',
            email='demo@truetribe.com',
            password='demo123',
            first_name='Demo',
            last_name='User',
            bio='This is a demo user for TrueTribe platform',
            trust_score=92.0,
            is_verified=True,
            followers_count=1234,
            following_count=567,
            posts_count=89
        )
        
        # Create trust score
        TrustScore.objects.create(
            user=demo_user,
            base_score=80.0,
            verification_bonus=10.0,
            activity_score=5.0,
            community_score=7.0,
            penalty_score=0.0,
            final_score=92.0
        )
        
        print("Demo user created successfully!")
    
    # Create more sample users
    sample_users = [
        {'username': 'alice_smith', 'email': 'alice@example.com', 'first_name': 'Alice', 'last_name': 'Smith'},
        {'username': 'bob_jones', 'email': 'bob@example.com', 'first_name': 'Bob', 'last_name': 'Jones'},
        {'username': 'carol_white', 'email': 'carol@example.com', 'first_name': 'Carol', 'last_name': 'White'},
    ]
    
    for user_data in sample_users:
        if not User.objects.filter(username=user_data['username']).exists():
            user = User.objects.create_user(
                password='password123',
                trust_score=75.0,
                **user_data
            )
            TrustScore.objects.create(user=user, final_score=75.0)
    
    print("Sample data created successfully!")
    print("Demo user credentials: demo / demo123")