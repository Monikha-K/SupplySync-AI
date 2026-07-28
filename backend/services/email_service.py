import os
import smtplib
import logging
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("supplysync.email_service")


class EmailService:
    """Multi-provider email dispatch service supporting AgentMail API, Brevo API, SMTP, and Mock execution."""

    def __init__(self):
        self.reload_config()

    def reload_config(self):
        load_dotenv(override=True)
        self.provider = os.getenv("EMAIL_PROVIDER", "auto").lower()
        self.agentmail_api_key = os.getenv("AGENTMAIL_API_KEY")
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.sender_email = os.getenv("SENDER_EMAIL", "notifications@supplysync.ai")
        self.brevo_api_key = os.getenv("BREVO_API_KEY")

    def send_email(self, recipient_email: str, subject: str, body: str) -> Dict[str, Any]:
        """
        Send customer email via AgentMail API, Brevo API, SMTP, or Mock logger.
        Returns dispatch summary dictionary.
        """
        self.reload_config()
        # Try AgentMail API first if configured
        if (self.provider == "agentmail" or (self.provider == "auto" and self.agentmail_api_key)) and self.agentmail_api_key:
            return self._send_via_agentmail(recipient_email, subject, body)

        # Try Brevo API if configured
        if (self.provider == "brevo" or (self.provider == "auto" and self.brevo_api_key)) and self.brevo_api_key:
            return self._send_via_brevo(recipient_email, subject, body)

        # Try SMTP if configured
        if (self.provider == "smtp" or (self.provider == "auto" and self.smtp_username and self.smtp_password)) and self.smtp_username and self.smtp_password:
            return self._send_via_smtp(recipient_email, subject, body)

        # Fallback to Mock / Console Logger
        return self._send_via_mock(recipient_email, subject, body)

    def _send_via_agentmail(self, recipient_email: str, subject: str, body: str) -> Dict[str, Any]:
        """Send live email via AgentMail API endpoint."""
        try:
            headers = {
                "Authorization": f"Bearer {self.agentmail_api_key}",
                "Content-Type": "application/json"
            }
            # Step 1: Discover active inbox ID
            inbox_res = requests.get("https://api.agentmail.to/inboxes", headers=headers, timeout=5)
            if inbox_res.status_code == 200:
                data = inbox_res.json()
                inboxes = data.get("inboxes", [])
                if inboxes:
                    inbox_id = inboxes[0].get("inbox_id")
                    send_url = f"https://api.agentmail.to/inboxes/{inbox_id}/messages/send"
                    payload = {
                        "to": recipient_email,
                        "subject": subject,
                        "text": body
                    }
                    res = requests.post(send_url, json=payload, headers=headers, timeout=5)
                    if res.status_code in [200, 201, 202]:
                        res_data = res.json()
                        msg_id = res_data.get("message_id", "sent")
                        logger.info(f"Live email sent via AgentMail API to {recipient_email}. Message ID: {msg_id}")
                        return {
                            "status": "Sent via AgentMail API (Live Inbox Delivery)",
                            "provider": "AgentMail API",
                            "recipient": recipient_email,
                            "subject": subject,
                            "message_id": msg_id
                        }
                    else:
                        logger.error(f"AgentMail dispatch returned {res.status_code}: {res.text}. Falling back to mock.")
            else:
                logger.error(f"AgentMail fetch inboxes returned {inbox_res.status_code}: {inbox_res.text}")
        except Exception as e:
            logger.error(f"Failed to send email via AgentMail: {e}. Falling back to mock.", exc_info=True)

        return self._send_via_mock(recipient_email, subject, body)

    def _send_via_brevo(self, recipient_email: str, subject: str, body: str) -> Dict[str, Any]:
        """Send email via Brevo REST API v3."""
        try:
            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "accept": "application/json",
                "api-key": self.brevo_api_key,
                "content-type": "application/json"
            }
            payload = {
                "sender": {"name": "SupplySync AI Agent", "email": self.sender_email},
                "to": [{"email": recipient_email}],
                "subject": subject,
                "textContent": body
            }
            res = requests.post(url, json=payload, headers=headers, timeout=5)
            if res.status_code in [200, 201, 202]:
                logger.info(f"Email successfully sent via Brevo API to {recipient_email}")
                return {
                    "status": "Sent via Brevo API",
                    "provider": "Brevo API",
                    "recipient": recipient_email,
                    "subject": subject
                }
            else:
                logger.error(f"Brevo API error {res.status_code}: {res.text}. Falling back to mock.")
                return self._send_via_mock(recipient_email, subject, body)
        except Exception as e:
            logger.error(f"Failed to send email via Brevo: {e}. Falling back to mock.")
            return self._send_via_mock(recipient_email, subject, body)

    def _send_via_smtp(self, recipient_email: str, subject: str, body: str) -> Dict[str, Any]:
        """Send email via SMTP with TLS encryption."""
        try:
            msg = MIMEMultipart()
            msg["From"] = self.sender_email
            msg["To"] = recipient_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=5) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)

            logger.info(f"Email successfully sent via SMTP to {recipient_email}")
            return {
                "status": "Sent via SMTP",
                "provider": "SMTP",
                "recipient": recipient_email,
                "subject": subject
            }
        except Exception as e:
            logger.error(f"SMTP dispatch failed: {e}. Falling back to mock dispatch.")
            return self._send_via_mock(recipient_email, subject, body)

    def _send_via_mock(self, recipient_email: str, subject: str, body: str) -> Dict[str, Any]:
        """Mock dispatch logger for fallback execution."""
        logger.info(
            f"\n[DEMO/MOCK EMAIL DISPATCH]\n"
            f"TO: {recipient_email}\n"
            f"SUBJECT: {subject}\n"
            f"BODY:\n{body}\n"
            f"--------------------------------------------------\n"
        )
        return {
            "status": "Dispatched (Simulated / Console Logged)",
            "provider": "SupplySync Email Dispatcher (Simulated)",
            "recipient": recipient_email,
            "subject": subject
        }


# Global instance
email_service = EmailService()
