"""
Notification helpers for user-controlled email/mobile delivery.
Backend decides whether to send based on stored user preferences.
"""

import json
import logging
from django.utils import timezone

from database.models import User as MongoUser
from .models import Notification, UserProfile
from .email_templates import send_templated_email


DEFAULT_EMAIL_ENABLED = True
DEFAULT_MOBILE_ENABLED = False
logger = logging.getLogger(__name__)


def _extract_pref(prefs, keys):
    for key in keys:
        if key in prefs:
            return bool(prefs.get(key))
    return None


def _normalize_prefs(prefs):
    prefs = prefs or {}
    email_pref = _extract_pref(prefs, ['emailNotif', 'emailNotifications', 'email'])
    mobile_pref = _extract_pref(prefs, ['smsNotif', 'mobileNotif', 'mobile', 'sms'])
    if email_pref is None:
        email_pref = DEFAULT_EMAIL_ENABLED
    if mobile_pref is None:
        mobile_pref = DEFAULT_MOBILE_ENABLED
    return {
        'email': bool(email_pref),
        'mobile': bool(mobile_pref),
    }


def _get_contact_info(email):
    profile = UserProfile.objects.filter(email=email).first()
    if profile:
        return {
            'email': profile.email,
            'phone': profile.phone or '',
            'prefs': profile.coffee_preferences or {},
        }
    try:
        mongo_user = MongoUser.find_by_email(email) or {}
    except Exception:
        logger.exception("Mongo user lookup failed for notification email=%s", email)
        mongo_user = {}
    return {
        'email': mongo_user.get('email') or email,
        'phone': mongo_user.get('phone') or '',
        'prefs': mongo_user.get('coffeePreferences') or {},
    }


def _send_email(subject, message, recipient, html=None):
    return send_templated_email(
        recipient=recipient,
        subject=subject,
        text_message=message,
        title=subject,
        message=message,
        header_subtitle="Account Notification",
        html_message=html,
    )


def _send_mobile(message, recipient_phone):
    if not recipient_phone:
        return False, 'missing_phone'
    # SMS backend logic removed - feature coming soon
    # Always return False so mobile notifications are never attempted
    return False, 'sms_disabled'


def dispatch_notification(
    *,
    email,
    category,
    event,
    title,
    message,
    payload=None,
    send_immediately=True
):
    """
    Create notification records and optionally attempt delivery immediately.
    Returns list of Notification records created.
    """
    profile = UserProfile.objects.filter(email=email).first()
    contact = _get_contact_info(email)
    prefs = _normalize_prefs(contact.get('prefs'))
    created = []

    # Email channel
    email_status = 'queued' if prefs['email'] else 'skipped'
    email_reason = None if prefs['email'] else 'user_disabled'
    if prefs['email'] and not contact.get('email'):
        email_status = 'skipped'
        email_reason = 'missing_email'
    email_record = Notification.objects.create(
        user=profile.user if profile else None,
        email=contact.get('email') or email,
        phone=contact.get('phone') or '',
        channel='email',
        category=category,
        event=event,
        title=title,
        message=message,
        payload=payload or {},
        status=email_status,
        status_reason=email_reason or '',
    )
    created.append(email_record)

    # Mobile channel
    mobile_status = 'queued' if prefs['mobile'] else 'skipped'
    mobile_reason = None if prefs['mobile'] else 'user_disabled'
    if prefs['mobile'] and not contact.get('phone'):
        mobile_status = 'skipped'
        mobile_reason = 'missing_phone'
    mobile_record = Notification.objects.create(
        user=profile.user if profile else None,
        email=contact.get('email') or email,
        phone=contact.get('phone') or '',
        channel='mobile',
        category=category,
        event=event,
        title=title,
        message=message,
        payload=payload or {},
        status=mobile_status,
        status_reason=mobile_reason or '',
    )
    created.append(mobile_record)

    if send_immediately:
        # Email delivery
        if email_record.status == 'queued':
            ok, reason = _send_email(title, message, email_record.email)
            email_record.status = 'sent' if ok else 'failed'
            email_record.status_reason = '' if ok else (reason or 'email_failed')
            email_record.sent_at = timezone.now() if ok else None
            email_record.save(update_fields=['status', 'status_reason', 'sent_at', 'updated_at'])
            if not ok:
                logger.error(
                    "Notification email send failed email=%s event=%s category=%s reason=%s",
                    email_record.email,
                    event,
                    category,
                    email_record.status_reason,
                )

        # Mobile delivery
        if mobile_record.status == 'queued':
            ok, reason = _send_mobile(message, mobile_record.phone)
            mobile_record.status = 'sent' if ok else 'failed'
            mobile_record.status_reason = '' if ok else (reason or 'mobile_failed')
            mobile_record.sent_at = timezone.now() if ok else None
            mobile_record.save(update_fields=['status', 'status_reason', 'sent_at', 'updated_at'])

    return created


def notify_order_event(email, event, order=None, status=None):
    order_id = None
    if order is not None:
        extra = getattr(order, 'extra_fields', None) or {}
        # Parse JSON string if needed
        if isinstance(extra, str):
            try:
                extra = json.loads(extra)
            except (json.JSONDecodeError, TypeError):
                extra = {}
        if not isinstance(extra, dict):
            extra = {}
        # Use clientOrderId if available, fallback to database id
        order_id = (
            extra.get('clientOrderId')
            or extra.get('orderId')
            or extra.get('order_id')
            or getattr(order, 'orderId', None)
            or getattr(order, 'id', None)
        )
    normalized_status = str(status or '').strip().lower()

    if event == 'order_placed':
        title = 'Order placed'
        message = f'Your order {order_id} has been placed. Status: {status or "pending"}.'
    elif event in ('order_confirmed', 'order_approved') or (event == 'order_status_update' and normalized_status == 'confirmed'):
        title = 'Order confirmed'
        message = f'Your order {order_id} has been confirmed and will be prepared shortly.'
    elif event == 'order_cancelled':
        title = 'Order cancelled'
        message = f'Your order {order_id} has been cancelled.'
    else:
        title = 'Order status update'
        message = f'Your order {order_id} status updated to {status or "updated"}.'

    payload = {
        'orderId': str(order_id) if order_id is not None else None,
        'status': status,
    }
    return dispatch_notification(
        email=email,
        category='order',
        event=event,
        title=title,
        message=message,
        payload=payload,
        send_immediately=True,
    )


def notify_offer(email, title, message, payload=None, send_immediately=True):
    return dispatch_notification(
        email=email,
        category='offer',
        event='offer',
        title=title,
        message=message,
        payload=payload or {},
        send_immediately=send_immediately,
    )


def notify_announcement(email, title, message, payload=None, send_immediately=True):
    return dispatch_notification(
        email=email,
        category='announcement',
        event='announcement',
        title=title,
        message=message,
        payload=payload or {},
        send_immediately=send_immediately,
    )
