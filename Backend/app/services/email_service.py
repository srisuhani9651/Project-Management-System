import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "noreply@projectflow.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


class EmailService:
    """
    Service for sending responsive HTML emails (Password Reset TOTP codes, Task Assignment Notifications).
    Wraps all email dispatches in try-except blocks so SMTP failures never break application logic.
    """

    @staticmethod
    def _safe_print(message: str) -> None:
        """
        Prints diagnostic/log lines without ever raising — some console encodings
        (e.g. Windows cp1252) can't render emoji, which would otherwise crash the
        caller before the actual email send is even attempted.
        """
        try:
            print(message)
        except UnicodeEncodeError:
            print(message.encode("ascii", errors="replace").decode("ascii"))

    @staticmethod
    def _send_email(to_email: str, subject: str, html_content: str) -> bool:
        """Sends an HTML email over SMTP gracefully."""
        EmailService._safe_print(f"\n=======================================================")
        EmailService._safe_print(f"[EMAIL SERVICE DISPATCH] To: {to_email}")
        EmailService._safe_print(f"Subject: {subject}")
        EmailService._safe_print(f"=======================================================")

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"ProjectFlow <{SENDER_EMAIL}>"
            msg["To"] = to_email

            html_part = MIMEText(html_content, "html", "utf-8")
            msg.attach(html_part)

            # If real SMTP credentials are provided, dispatch via SMTP server
            if SMTP_USER and SMTP_PASSWORD:
                server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5)
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SENDER_EMAIL, [to_email], msg.as_string())
                server.quit()
                EmailService._safe_print(f"[EMAIL SERVICE SUCCESS] Email sent to {to_email}")
            else:
                EmailService._safe_print(f"[EMAIL SERVICE MOCK DISPATCH] SMTP credentials not configured. Printed email contents to console.")
            return True
        except Exception as e:
            EmailService._safe_print(f"[EMAIL SERVICE WARNING] Failed to deliver email to {to_email}: {e}")
            return False

    @staticmethod
    def send_password_reset_email(to_email: str, user_name: str, code: str) -> bool:
        """Sends 6-digit TOTP password reset code via responsive HTML email."""
        subject = f"{code} is your ProjectFlow Password Reset Code"
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; color: #1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 40px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 28px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                                Project<span style="color: #3b82f6;">Flow</span>
                            </h1>
                            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">Secure Password Reset Request</p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 28px;">
                            <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">Hello <strong>{user_name}</strong>,</p>
                            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0;">
                                We received a request to reset your password for your ProjectFlow workspace account. Use the 6-digit code below to complete your password reset:
                            </p>

                            <!-- Code Box -->
                            <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                                <span style="font-family: monospace, Courier; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2563eb;">
                                    {code}
                                </span>
                                <p style="font-size: 11px; color: #ef4444; font-weight: 700; margin: 8px 0 0 0;">
                                    ⏱️ Code expires in 30 seconds
                                </p>
                            </div>

                            <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 16px 0;">
                                If you did not request a password reset, you can safely ignore this email. Your account remains secure.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="font-size: 11px; color: #94a3b8; margin: 0;">&copy; 2026 ProjectFlow Systems Inc. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """
        EmailService._safe_print(f"\n[TOTP CODE FOR {to_email}]: {code} (Valid for 30s)\n")
        return EmailService._send_email(to_email, subject, html_content)

    @staticmethod
    def send_task_assignment_email(
        to_email: str,
        assignee_name: str,
        assigner_name: str,
        project_name: str,
        task_title: str,
        task_description: Optional[str],
        priority: str,
        status: str,
        due_date: Optional[str],
        task_id: str
    ) -> bool:
        """Sends a responsive HTML email when a task is created or assigned/reassigned."""
        subject = f"Task Assigned: {task_title} in {project_name}"
        task_url = f"{FRONTEND_URL}/tasks/{task_id}"

        priority_bg = "#3b82f6"
        p_lower = (priority or "").lower()
        if p_lower in ("high", "urgent"):
            priority_bg = "#ef4444"
        elif p_lower == "medium":
            priority_bg = "#f59e0b"

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Task Assignment</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; color: #1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 40px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 24px 28px; text-align: left;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">
                                Project<span style="color: #3b82f6;">Flow</span>
                            </h1>
                            <p style="color: #94a3b8; margin: 2px 0 0 0; font-size: 12px;">Task Assignment Notification</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 28px;">
                            <p style="font-size: 14px; color: #334155; margin: 0 0 12px 0;">Hello <strong>{assignee_name}</strong>,</p>
                            <p style="font-size: 13px; color: #64748b; margin: 0 0 20px 0; line-height: 1.5;">
                                <strong>{assigner_name}</strong> assigned a task to you in the <strong>{project_name}</strong> workspace.
                            </p>

                            <!-- Task Details Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding-bottom: 12px;">
                                        <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Task Title</span>
                                        <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 4px 0 0 0;">{task_title}</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 12px;">
                                        <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Description</span>
                                        <p style="font-size: 13px; color: #475569; margin: 4px 0 0 0; line-height: 1.5;">
                                            {task_description or "No description provided."}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="33%" style="padding-top: 8px;">
                                                    <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Priority</span><br>
                                                    <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #ffffff; background-color: {priority_bg}; padding: 3px 8px; border-radius: 6px; margin-top: 2px;">
                                                        {priority}
                                                    </span>
                                                </td>
                                                <td width="33%" style="padding-top: 8px;">
                                                    <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Status</span><br>
                                                    <span style="font-size: 12px; font-weight: 700; color: #0f172a; display: inline-block; margin-top: 2px;">
                                                        {status}
                                                    </span>
                                                </td>
                                                <td width="33%" style="padding-top: 8px;">
                                                    <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Due Date</span><br>
                                                    <span style="font-size: 12px; font-weight: 700; color: #2563eb; display: inline-block; margin-top: 2px;">
                                                        {due_date or "No due date"}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Action Button -->
                            <div style="text-align: center; margin: 28px 0 12px 0;">
                                <a href="{task_url}" target="_blank" style="background-color: #2563eb; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                                    View Task Details &rarr;
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 16px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="font-size: 11px; color: #94a3b8; margin: 0;">&copy; 2026 ProjectFlow Systems Inc.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """
        EmailService._safe_print(f"\n[TASK NOTIFICATION EMAIL TO {to_email}]: {task_title} ({project_name})\n")
        return EmailService._send_email(to_email, subject, html_content)
