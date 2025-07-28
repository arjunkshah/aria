"""
Email Configuration Helper for ARIA Backend

To set up email notifications:

1. For Gmail:
   - Enable 2-factor authentication
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use your email and the app password

2. For other providers:
   - Check your email provider's SMTP settings
   - Update the SMTP_SERVER and SMTP_PORT accordingly

3. Set environment variables:
   export SENDER_EMAIL=your-email@gmail.com
   export SENDER_PASSWORD=your-app-password
   export SMTP_SERVER=smtp.gmail.com
   export SMTP_PORT=587

4. Test the configuration:
   curl -X POST http://localhost:8000/email/test \
     -H "Content-Type: application/json" \
     -d '{"email": "your-test-email@example.com"}'
"""

import os
from dotenv import load_dotenv

load_dotenv()

def print_email_setup_instructions():
    """Print email setup instructions"""
    print("📧 Email Configuration Setup")
    print("=" * 50)
    print()
    print("To enable email notifications, set these environment variables:")
    print()
    print("For Gmail:")
    print("  export SENDER_EMAIL=your-email@gmail.com")
    print("  export SENDER_PASSWORD=your-app-password")
    print("  export SMTP_SERVER=smtp.gmail.com")
    print("  export SMTP_PORT=587")
    print()
    print("For Outlook/Hotmail:")
    print("  export SENDER_EMAIL=your-email@outlook.com")
    print("  export SENDER_PASSWORD=your-password")
    print("  export SMTP_SERVER=smtp-mail.outlook.com")
    print("  export SMTP_PORT=587")
    print()
    print("For Yahoo:")
    print("  export SENDER_EMAIL=your-email@yahoo.com")
    print("  export SENDER_PASSWORD=your-app-password")
    print("  export SMTP_SERVER=smtp.mail.yahoo.com")
    print("  export SMTP_PORT=587")
    print()
    print("Steps for Gmail:")
    print("1. Enable 2-factor authentication")
    print("2. Generate App Password: https://myaccount.google.com/apppasswords")
    print("3. Use the app password (not your regular password)")
    print()
    print("Test email configuration:")
    print("  curl -X POST http://localhost:8000/email/test \\")
    print("    -H 'Content-Type: application/json' \\")
    print("    -d '{\"email\": \"your-test-email@example.com\"}'")
    print()

def check_email_config():
    """Check if email is properly configured"""
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")
    
    if not sender_email or not sender_password:
        print("❌ Email not configured")
        print_email_setup_instructions()
        return False
    
    print("✅ Email configuration found")
    print(f"   Sender: {sender_email}")
    print(f"   SMTP Server: {os.getenv('SMTP_SERVER', 'smtp.gmail.com')}")
    print(f"   SMTP Port: {os.getenv('SMTP_PORT', '587')}")
    return True

if __name__ == "__main__":
    check_email_config() 