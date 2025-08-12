#!/usr/bin/env python
"""
TrueTribe Backend Test Script
Tests all major functionality to ensure everything works live
"""
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truetribe_backend.settings')
django.setup()

BASE_URL = 'http://127.0.0.1:8000/api'

def test_authentication():
    print("🔐 Testing Authentication...")
    
    # Test registration
    register_data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/register/', json=register_data)
        if response.status_code == 201:
            print("✅ Registration successful")
            return response.json()['tokens']['access']
        else:
            print(f"❌ Registration failed: {response.text}")
    except Exception as e:
        print(f"❌ Registration error: {e}")
    
    # Test login with demo user
    login_data = {
        'email': 'demo@truetribe.com',
        'password': 'demo123'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
        if response.status_code == 200:
            print("✅ Login successful")
            return response.json()['tokens']['access']
        else:
            print(f"❌ Login failed: {response.text}")
    except Exception as e:
        print(f"❌ Login error: {e}")
    
    return None

def test_posts(token):
    print("📝 Testing Posts...")
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test create post
    post_data = {
        'content': 'This is a test post from the backend test script!'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/posts/create/', json=post_data, headers=headers)
        if response.status_code == 201:
            print("✅ Post creation successful")
            post_id = response.json()['id']
            
            # Test like post
            like_response = requests.post(f'{BASE_URL}/posts/{post_id}/like/', headers=headers)
            if like_response.status_code == 200:
                print("✅ Post like successful")
            
            return post_id
        else:
            print(f"❌ Post creation failed: {response.text}")
    except Exception as e:
        print(f"❌ Post creation error: {e}")
    
    return None

def test_users(token):
    print("👥 Testing Users...")
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        # Test get current user
        response = requests.get(f'{BASE_URL}/auth/me/', headers=headers)
        if response.status_code == 200:
            print("✅ Get current user successful")
            
            # Test get users list
            users_response = requests.get(f'{BASE_URL}/users/', headers=headers)
            if users_response.status_code == 200:
                print("✅ Get users list successful")
                return True
        else:
            print(f"❌ Get current user failed: {response.text}")
    except Exception as e:
        print(f"❌ Users test error: {e}")
    
    return False

def test_trust_system(token):
    print("🛡️ Testing Trust System...")
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        # Test get trust score
        response = requests.get(f'{BASE_URL}/trust/score/', headers=headers)
        if response.status_code == 200:
            print("✅ Get trust score successful")
            
            # Test record trust action
            action_data = {
                'action_type': 'post_like',
                'score_change': 1.0,
                'description': 'Test trust action'
            }
            action_response = requests.post(f'{BASE_URL}/trust/actions/record/', json=action_data, headers=headers)
            if action_response.status_code == 201:
                print("✅ Record trust action successful")
                return True
        else:
            print(f"❌ Get trust score failed: {response.text}")
    except Exception as e:
        print(f"❌ Trust system test error: {e}")
    
    return False

def test_notifications(token):
    print("🔔 Testing Notifications...")
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        # Test get notifications
        response = requests.get(f'{BASE_URL}/notifications/', headers=headers)
        if response.status_code == 200:
            print("✅ Get notifications successful")
            
            # Test get unread count
            count_response = requests.get(f'{BASE_URL}/notifications/unread-count/', headers=headers)
            if count_response.status_code == 200:
                print("✅ Get unread count successful")
                return True
        else:
            print(f"❌ Get notifications failed: {response.text}")
    except Exception as e:
        print(f"❌ Notifications test error: {e}")
    
    return False

def test_verification(token):
    print("✅ Testing Verification...")
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        # Test verification status
        response = requests.get(f'{BASE_URL}/verification/status/', headers=headers)
        if response.status_code == 200:
            print("✅ Get verification status successful")
            
            # Test send email verification
            email_data = {'email': 'test@example.com'}
            email_response = requests.post(f'{BASE_URL}/verification/email/send/', json=email_data, headers=headers)
            if email_response.status_code == 200:
                print("✅ Send email verification successful")
                return True
        else:
            print(f"❌ Get verification status failed: {response.text}")
    except Exception as e:
        print(f"❌ Verification test error: {e}")
    
    return False

def main():
    print("🚀 Starting TrueTribe Backend Tests...\n")
    
    # Test authentication
    token = test_authentication()
    if not token:
        print("❌ Authentication failed, cannot continue tests")
        return
    
    print(f"🔑 Using token: {token[:20]}...\n")
    
    # Run all tests
    tests = [
        ('Users', test_users),
        ('Posts', test_posts),
        ('Trust System', test_trust_system),
        ('Notifications', test_notifications),
        ('Verification', test_verification)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func(token)
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
        print()
    
    # Print summary
    print("📊 Test Results Summary:")
    print("=" * 40)
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
    
    print("=" * 40)
    print(f"Tests Passed: {passed}/{len(results)}")
    
    if passed == len(results):
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")

if __name__ == '__main__':
    main()