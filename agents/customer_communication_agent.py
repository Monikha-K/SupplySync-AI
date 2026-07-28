import logging
from datetime import datetime, timezone
from models.shipment import ShipmentData
from models.prediction import RiskPrediction, EmailContent
from services.gemini_service import gemini_service
from services.email_service import email_service

logger = logging.getLogger("supplysync.customer_agent")


class CustomerCommunicationAgent:
    """
    Autonomous Customer Communication Agent.
    Invoked when Risk Prediction Agent identifies High Risk (Risk Score >= Threshold).
    Generates professional delay notification email and dispatches email via EmailService.
    """

    def __init__(self):
        self.gemini = gemini_service
        self.email_svc = email_service

    def notify_customer_of_delay(self, shipment: ShipmentData, prediction_dict: dict) -> EmailContent:
        """
        Generate and send a professional delay update email to the customer.
        """
        logger.info(f"CustomerCommunicationAgent triggered for shipment {shipment.shipment_id}")

        shipment_dict = shipment.model_dump()
        
        # Step 1: Generate professional customer email content
        email_data = self.gemini.generate_customer_email(shipment_dict, prediction_dict)
        subject = email_data.get("subject", f"Shipment Delay Notification - {shipment.shipment_id}")
        body = email_data.get("body", "Dear Customer, Your shipment is expected to experience a minor delay.")

        # Step 2: Send email via EmailService
        dispatch_result = self.email_svc.send_email(
            recipient_email=shipment.customer_email,
            subject=subject,
            body=body
        )

        now_str = datetime.now(timezone.utc).isoformat()
        
        # Step 3: Package EmailContent model
        email_content = EmailContent(
            subject=subject,
            body=body,
            sent_at=now_str,
            recipient=shipment.customer_email,
            status=dispatch_result.get("status", "Dispatched")
        )

        logger.info(f"CustomerCommunicationAgent completed email dispatch for {shipment.shipment_id}")
        return email_content


# Global instance
customer_agent = CustomerCommunicationAgent()
