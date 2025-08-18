import africastalking
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

# Initialize Africa's Talking
africastalking.initialize(
    username=settings.AFRICASTALKING_USERNAME,
    api_key=settings.AFRICASTALKING_API_KEY
)
sms = africastalking.SMS

def log_notification_attempt(order, notification_type, status, details=None):
    """Helper function to log all notification attempts"""
    log_message = (
        f"Order #{order.id} - {notification_type} - {status}\n"
        f"Customer: {order.customer.user.username}\n"
        f"Status: {order.get_status_display()}\n"
        f"Total: {order.total}\n"
    )
    if details:
        log_message += f"Details: {details}\n"
    logger.info(log_message)

def send_order_notifications(order):
    """
    Send notifications to admin and customer about new order
    """
    try:
        logger.info(f"Starting notifications for order #{order.id}")
        
        # Send email to admin
        send_order_email_to_admin(order)
        
        # Send email to customer
        send_order_email_to_customer(order)
        
        # Send SMS to admin
        send_order_sms_to_admin(order)
        
        # Send SMS to customer if phone number exists
        if order.customer.phone_number:
            send_order_sms_to_customer(order)
        else:
            logger.warning(f"No phone number for customer {order.customer.user.username}")
            
        logger.info(f"All notifications sent successfully for order #{order.id}")
        
    except Exception as e:
        logger.error(f"Failed to send notifications for order {order.id}: {str(e)}", exc_info=True)

def send_order_email_to_admin(order):
    try:
        subject = f"New Order Received - #{order.id}"
        html_message = render_to_string('emails/order_admin.html', {
            'order': order,
            'items': order.items.all()
        })
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.ADMIN_EMAIL],
            html_message=html_message,
            fail_silently=False
        )
        log_notification_attempt(
            order,
            "Admin Email",
            "Success",
            f"Sent to {settings.ADMIN_EMAIL}"
        )
    except Exception as e:
        log_notification_attempt(
            order,
            "Admin Email",
            "Failed",
            str(e)
        )
        raise

def send_order_email_to_customer(order):
    try:
        subject = f"Your Order Confirmation - #{order.id}"
        html_message = render_to_string('emails/order_customer.html', {
            'order': order,
            'items': order.items.all()
        })
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [order.customer.user.email],
            html_message=html_message,
            fail_silently=False
        )
        log_notification_attempt(
            order,
            "Customer Email",
            "Success",
            f"Sent to {order.customer.user.email}"
        )
    except Exception as e:
        log_notification_attempt(
            order,
            "Customer Email",
            "Failed",
            str(e)
        )
        raise

def send_order_sms_to_admin(order):
    try:
        message = (f"New Order #{order.id} received from {order.customer.user.username}. "
                   f"Total: KES {order.total}. Status: {order.get_status_display()}")
        
        response = sms.send(message, [settings.ADMIN_PHONE])
        log_notification_attempt(
            order,
            "Admin SMS",
            "Success",
            f"Response: {response}"
        )
    except Exception as e:
        log_notification_attempt(
            order,
            "Admin SMS",
            "Failed",
            str(e)
        )
        raise

def send_order_sms_to_customer(order):
    try:
        message = (f"Thank you for your order #{order.id}. "
                   f"Total: KES {order.total}. We'll notify you when it's processed.")
        
        response = sms.send(message, [order.customer.phone])
        log_notification_attempt(
            order,
            "Customer SMS",
            "Success",
            f"Response: {response}"
        )
    except Exception as e:
        log_notification_attempt(
            order,
            "Customer SMS",
            "Failed",
            str(e)
        )
        raise