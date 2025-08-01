import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
from datetime import datetime
from typing import List, Optional
import asyncio
import threading

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL", "")
        self.sender_password = os.getenv("SENDER_PASSWORD", "")
        self.enabled = bool(self.sender_email and self.sender_password)
        
        if not self.enabled:
            print("⚠️  Email service not configured. Set SENDER_EMAIL and SENDER_PASSWORD environment variables.")
    
    def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        if not self.enabled:
            print(f"📧 Email not sent (service disabled): {subject}")
            return False
        
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = to_email
            
            # Add plain text and HTML parts
            text_part = MIMEText(body, "plain")
            message.attach(text_part)
            
            if html_body:
                html_part = MIMEText(html_body, "html")
                message.attach(html_part)
            
            # Create secure connection
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, to_email, message.as_string())
            
            print(f"✅ Email sent successfully: {subject} to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False
    
    def send_changelog_notification(self, to_email: str, repo_name: str, version: str, changes: List[str], pr_count: int) -> bool:
        subject = f"🚀 New Changelog Generated: {version} for {repo_name}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🎉 New Changelog Generated!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">ARIA has automatically generated a new changelog for your repository.</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h2 style="color: #667eea; margin-top: 0;">Repository: {repo_name}</h2>
                    <p><strong>Version:</strong> {version}</p>
                    <p><strong>Pull Requests Processed:</strong> {pr_count}</p>
                    <p><strong>Generated:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
                    <h3 style="color: #333; margin-top: 0;">Changes Summary:</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        {''.join([f'<li style="margin-bottom: 8px;">{change}</li>' for change in changes])}
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        This changelog was automatically generated by ARIA - AI Changelog Companion.<br>
                        Visit your dashboard to view the full changelog and manage your repositories.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        New Changelog Generated!
        
        Repository: {repo_name}
        Version: {version}
        Pull Requests Processed: {pr_count}
        Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        
        Changes Summary:
        {chr(10).join([f'- {change}' for change in changes])}
        
        This changelog was automatically generated by ARIA - AI Changelog Companion.
        Visit your dashboard to view the full changelog and manage your repositories.
        """
        
        return self.send_email(to_email, subject, text_body, html_body)
    
    def send_project_notification(self, to_email: str, project_name: str, repo_name: str, action: str) -> bool:
        subject = f"🔔 ARIA Project Update: {action}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🔔 Project Update</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your ARIA project has been updated.</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h2 style="color: #667eea; margin-top: 0;">Project: {project_name}</h2>
                    <p><strong>Repository:</strong> {repo_name}</p>
                    <p><strong>Action:</strong> {action}</p>
                    <p><strong>Updated:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        Visit your ARIA dashboard to view the full details and manage your project.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Project Update
        
        Project: {project_name}
        Repository: {repo_name}
        Action: {action}
        Updated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        
        Visit your ARIA dashboard to view the full details and manage your project.
        """
        
        return self.send_email(to_email, subject, text_body, html_body)
    
    def send_error_notification(self, to_email: str, error_message: str, project_name: str = "Unknown") -> bool:
        subject = f"⚠️ ARIA Error Alert: {project_name}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">⚠️ Error Alert</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">An error occurred in your ARIA project.</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h2 style="color: #dc3545; margin-top: 0;">Project: {project_name}</h2>
                    <p><strong>Error:</strong> {error_message}</p>
                    <p><strong>Time:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107;">
                    <h3 style="color: #856404; margin-top: 0;">What to do:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #856404;">
                        <li>Check your project settings in the ARIA dashboard</li>
                        <li>Verify your GitHub token is valid</li>
                        <li>Ensure your repository is accessible</li>
                        <li>Contact support if the issue persists</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        Visit your ARIA dashboard to resolve this issue and manage your project.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Error Alert
        
        Project: {project_name}
        Error: {error_message}
        Time: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        
        What to do:
        - Check your project settings in the ARIA dashboard
        - Verify your GitHub token is valid
        - Ensure your repository is accessible
        - Contact support if the issue persists
        
        Visit your ARIA dashboard to resolve this issue and manage your project.
        """
        
        return self.send_email(to_email, subject, text_body, html_body)
    
    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        subject = "🎉 Welcome to ARIA - AI Changelog Companion!"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to ARIA!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">AI Changelog Companion</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h2 style="color: #667eea; margin-top: 0;">Hello {user_name}!</h2>
                    <p>Welcome to ARIA, your AI-powered changelog companion. We're excited to help you automate your changelog generation process.</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
                    <h3 style="color: #333; margin-top: 0;">Getting Started:</h3>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Create your first project</li>
                        <li style="margin-bottom: 8px;">Connect your GitHub repository</li>
                        <li style="margin-bottom: 8px;">Enable auto-generation</li>
                        <li style="margin-bottom: 8px;">Watch ARIA generate changelogs automatically!</li>
                    </ol>
                </div>
                
                <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; border-left: 4px solid #28a745;">
                    <h3 style="color: #155724; margin-top: 0;">Key Features:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #155724;">
                        <li style="margin-bottom: 8px;">🤖 AI-powered changelog generation</li>
                        <li style="margin-bottom: 8px;">🔄 Automatic monitoring of pull requests</li>
                        <li style="margin-bottom: 8px;">📧 Email notifications</li>
                        <li style="margin-bottom: 8px;">🎨 Beautiful, modern interface</li>
                        <li style="margin-bottom: 8px;">⚡ Real-time updates</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        Ready to get started? Visit your ARIA dashboard and create your first project!
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Welcome to ARIA!
        
        Hello {user_name}!
        
        Welcome to ARIA, your AI-powered changelog companion. We're excited to help you automate your changelog generation process.
        
        Getting Started:
        1. Create your first project
        2. Connect your GitHub repository
        3. Enable auto-generation
        4. Watch ARIA generate changelogs automatically!
        
        Key Features:
        - AI-powered changelog generation
        - Automatic monitoring of pull requests
        - Email notifications
        - Beautiful, modern interface
        - Real-time updates
        
        Ready to get started? Visit your ARIA dashboard and create your first project!
        """
        
        return self.send_email(to_email, subject, text_body, html_body)

# Create global email service instance
email_service = EmailService() 