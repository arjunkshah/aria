#!/usr/bin/env python3
"""
Test script for ARIA API
Tests the complete auto-generation workflow
"""

import requests
import json
import time
import os
from datetime import datetime

# API configuration
API_BASE_URL = "http://localhost:8000"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")  # Set GITHUB_TOKEN environment variable

def print_step(step: str):
    """Print a formatted step"""
    print(f"\n{'='*50}")
    print(f"STEP: {step}")
    print(f"{'='*50}")

def print_response(response):
    """Print API response"""
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_api():
    """Test the complete API workflow"""
    
    print("🚀 Starting ARIA API Test Suite")
    print(f"API Base URL: {API_BASE_URL}")
    print(f"GitHub Token: {GITHUB_TOKEN[:10]}...")
    
    # Test email configuration
    test_email = "test@example.com"  # Replace with your email for testing
    
    # Step 1: Health check
    print_step("1. Health Check")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        print_response(response)
        if response.status_code != 200:
            print("❌ API is not running. Please start the backend first.")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Please start the backend with: python main.py")
        return False
    
    # Step 2: Create a project
    print_step("2. Create Project")
    project_data = {
        "name": "ARIA Test Project",
        "description": "Test project for auto-generation system",
        "github_token": GITHUB_TOKEN,
        "user_email": test_email
    }
    
    response = requests.post(f"{API_BASE_URL}/projects", json=project_data)
    print_response(response)
    
    if response.status_code != 200:
        print("❌ Failed to create project")
        return False
    
    project_id = response.json()["project_id"]
    print(f"✅ Project created with ID: {project_id}")
    
    # Step 3: Connect the ARIA repository
    print_step("3. Connect Repository")
    repo_data = {
        "project_id": project_id,
        "repo_url": "https://github.com/arjunkshah/aria"
    }
    
    response = requests.post(f"{API_BASE_URL}/repositories/connect", json=repo_data)
    print_response(response)
    
    if response.status_code != 200:
        print("❌ Failed to connect repository")
        return False
    
    repo_id = response.json()["repo_id"]
    print(f"✅ Repository connected: {repo_id}")
    
    # Step 4: Start auto-generation
    print_step("4. Start Auto-Generation")
    auto_gen_config = {
        "project_id": project_id,
        "enabled": True,
        "check_interval": 60  # 1 minute for testing
    }
    
    response = requests.post(f"{API_BASE_URL}/auto-generation/start", json=auto_gen_config)
    print_response(response)
    
    if response.status_code != 200:
        print("❌ Failed to start auto-generation")
        return False
    
    print("✅ Auto-generation started")
    
    # Step 5: Check auto-generation status
    print_step("5. Check Auto-Generation Status")
    response = requests.get(f"{API_BASE_URL}/auto-generation/status")
    print_response(response)
    
    # Step 6: List repositories
    print_step("6. List Repositories")
    response = requests.get(f"{API_BASE_URL}/repositories/{project_id}")
    print_response(response)
    
    # Step 7: Manually trigger changelog generation
    print_step("7. Manual Changelog Generation")
    response = requests.post(f"{API_BASE_URL}/changelogs/generate?project_id={project_id}&repo_id={repo_id}")
    print_response(response)
    
    # Step 8: Check changelogs
    print_step("8. Check Generated Changelogs")
    response = requests.get(f"{API_BASE_URL}/changelogs/{project_id}")
    print_response(response)
    
    # Step 9: Check notifications
    print_step("9. Check Notifications")
    response = requests.get(f"{API_BASE_URL}/notifications/{project_id}")
    print_response(response)
    
    # Step 9.5: Test email functionality
    print_step("9.5. Test Email Functionality")
    
    # Check email status
    response = requests.get(f"{API_BASE_URL}/email/status")
    print_response(response)
    
    # Test email configuration
    email_data = {"email": test_email}
    response = requests.post(f"{API_BASE_URL}/projects/{project_id}/email", json=email_data)
    print_response(response)
    
    # Test email sending
    response = requests.post(f"{API_BASE_URL}/email/test", json=email_data)
    print_response(response)
    
    # Step 10: Monitor for auto-generation (wait and check)
    print_step("10. Monitor Auto-Generation")
    print("Waiting 2 minutes for auto-generation to check for new PRs...")
    
    for i in range(12):  # 12 * 10 seconds = 2 minutes
        time.sleep(10)
        print(f"Checking... ({i+1}/12)")
        
        # Check notifications
        response = requests.get(f"{API_BASE_URL}/notifications/{project_id}")
        notifications = response.json()["notifications"]
        
        if notifications:
            print("🔔 New notifications found:")
            for notification in notifications:
                print(f"  - {notification['title']}: {notification['message']}")
        
        # Check changelogs
        response = requests.get(f"{API_BASE_URL}/changelogs/{project_id}")
        changelogs = response.json()["changelogs"]
        
        if changelogs:
            print("📝 Changelogs found:")
            for changelog in changelogs:
                print(f"  - {changelog['version']}: {len(changelog['changes'])} changes")
    
    # Step 11: Final status check
    print_step("11. Final Status Check")
    
    # Get project details
    response = requests.get(f"{API_BASE_URL}/projects/{project_id}")
    print_response(response)
    
    # Get auto-generation status
    response = requests.get(f"{API_BASE_URL}/auto-generation/status")
    print_response(response)
    
    print("\n🎉 Test completed!")
    print(f"Project ID: {project_id}")
    print(f"Repository: {repo_id}")
    print("Auto-generation is running and monitoring for changes...")
    
    return True

def create_test_pr():
    """Create a test PR to trigger auto-generation"""
    print_step("Creating Test PR")
    
    # This would create a test PR in the repository
    # For now, we'll just simulate it
    print("To test auto-generation with a real PR:")
    print("1. Create a new branch: git checkout -b test-auto-gen-2")
    print("2. Make changes: echo 'test change' >> test-file.txt")
    print("3. Commit: git commit -am 'test: Another test change'")
    print("4. Push: git push origin test-auto-gen-2")
    print("5. Create PR: gh pr create --title 'Test Auto-Gen 2' --body 'Testing auto-generation'")
    print("6. Merge: gh pr merge <PR_NUMBER> --merge")
    print("7. Watch for auto-generation to detect the change!")

if __name__ == "__main__":
    print("ARIA API Test Suite")
    print("==================")
    
    success = test_api()
    
    if success:
        print("\n✅ All tests passed!")
        create_test_pr()
    else:
        print("\n❌ Some tests failed. Please check the output above.") 