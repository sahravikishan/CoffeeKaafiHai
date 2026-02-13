import json
import random
import logging
from datetime import timedelta
from zoneinfo import ZoneInfo

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import PasswordResetOTP
from .email_templates import send_templated_email
from database.models import User as MongoUser

try:
    import bcrypt
except Exception:
    bcrypt = None


OTP_EXPIRY_MINUTES = getattr(settings, 'PASSWORD_RESET_OTP_EXPIRY_MINUTES', 5)
OTP_MAX_ATTEMPTS = getattr(settings, 'PASSWORD_RESET_OTP_MAX_ATTEMPTS', 5)
logger = logging.getLogger(__name__)


def _normalize_email(email):
    return (email or '').strip().lower()


def _get_user_by_email(email):
    user_model = get_user_model()
    return user_model.objects.filter(email__iexact=email).first()


def _invalidate_existing_otps(email):
    PasswordResetOTP.objects.filter(email__iexact=email, is_used=False).update(is_used=True)


def _create_otp_record(user, email):
    otp = f"{random.SystemRandom().randint(0, 999999):06d}"
    now = timezone.now()
    expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)
    record = PasswordResetOTP.objects.create(
        user=user,
        email=email,
        otp=otp,
        expires_at=expires_at
    )
    return otp, record


def _send_otp_email(email, otp):
    subject = "Your Password Reset OTP"

    text_message = (
        f"Your OTP is {otp}. It expires in {OTP_EXPIRY_MINUTES} minutes."
    )
    sent_at = timezone.localtime(
        timezone.now(),
        timezone=ZoneInfo('Asia/Kolkata')
    ).strftime('%a, %d/%m/%Y %I:%M %p')

    ok, reason = send_templated_email(
        recipient=email,
        subject=subject,
        text_message=text_message,
        title="Your OTP Code",
        message="Use this one-time password to reset your account:",
        code=otp,
        meta_lines=[
            f"This OTP expires in {OTP_EXPIRY_MINUTES} minutes.",
            f"Sent at: {sent_at}"
        ],
        footer_note="If you didn't request this, you can safely ignore this email.",
        header_subtitle="Secure Password Reset",
    )
    if not ok:
        raise RuntimeError(reason or "otp_email_send_failed")


def _get_latest_active_otp(email):
    return (
        PasswordResetOTP.objects
        .filter(email__iexact=email, is_used=False)
        .order_by('-created_at')
        .first()
    )


def _is_expired(record):
    return record.expires_at and record.expires_at <= timezone.now()


def _register_failed_attempt(record):
    record.attempts = (record.attempts or 0) + 1
    record.last_attempt_at = timezone.now()
    if record.attempts >= OTP_MAX_ATTEMPTS:
        record.is_used = True
    record.save(update_fields=['attempts', 'last_attempt_at', 'is_used'])


def _validate_otp(record, otp):
    if not record:
        return False, "OTP not found"
    if _is_expired(record):
        record.is_used = True
        record.save(update_fields=['is_used'])
        return False, "OTP expired"
    if record.attempts >= OTP_MAX_ATTEMPTS:
        record.is_used = True
        record.save(update_fields=['is_used'])
        return False, "Too many attempts"
    if record.otp != str(otp):
        _register_failed_attempt(record)
        return False, "Invalid OTP"
    return True, None


@csrf_exempt
@require_http_methods(["POST"])
def forgot_password(request):
    """
    Forgot password endpoint - sends OTP to user email.
    Expected request body: { "email": "user@example.com" }
    """
    try:
        data = json.loads(request.body)
        email = _normalize_email(data.get('email'))

        if not email:
            return JsonResponse({'message': 'Email is required'}, status=400)

        user = _get_user_by_email(email)
        if not user:
            return JsonResponse({'message': 'Email not found'}, status=404)

        # Invalidate any previous OTPs for this email to prevent reuse.
        _invalidate_existing_otps(email)
        otp, _record = _create_otp_record(user, email)

        try:
            # Send OTP to user's email using configured Gmail SMTP.
            _send_otp_email(email, otp)
        except Exception:
            logger.exception("Password reset OTP email failed for email=%s", email)
            return JsonResponse({'message': 'Unable to send OTP email'}, status=500)

        return JsonResponse({'message': 'OTP sent to your email'})

    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def verify_otp(request):
    """
    Verify OTP for password reset.
    Expected request body: { "email": "user@example.com", "otp": "123456" }
    """
    try:
        data = json.loads(request.body)
        email = _normalize_email(data.get('email'))
        otp = data.get('otp')

        if not email or not otp:
            return JsonResponse({'message': 'Email and OTP are required'}, status=400)

        record = _get_latest_active_otp(email)
        # Validate OTP against latest active record (expiry + attempt limits).
        valid, error_message = _validate_otp(record, otp)
        if not valid:
            return JsonResponse({'message': error_message}, status=400)

        # Mark OTP as verified to support multi-step flows if needed.
        record.is_verified = True
        record.verified_at = timezone.now()
        record.save(update_fields=['is_verified', 'verified_at'])

        return JsonResponse({'message': 'OTP verified'})

    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def reset_password(request):
    """
    Reset password endpoint - verifies OTP and updates password.
    Expected request body: {
        "email": "user@example.com",
        "otp": "123456",
        "newPassword": "newpassword123"
    }
    """
    try:
        data = json.loads(request.body)
        email = _normalize_email(data.get('email'))
        otp = data.get('otp')
        new_password = data.get('newPassword')

        if not all([email, otp, new_password]):
            return JsonResponse({'message': 'Email, OTP, and new password are required'}, status=400)

        user = _get_user_by_email(email)
        if not user:
            return JsonResponse({'message': 'Email not found'}, status=404)

        record = _get_latest_active_otp(email)
        # OTP must match, be unexpired, and not exceed max attempts.
        valid, error_message = _validate_otp(record, otp)
        if not valid:
            return JsonResponse({'message': error_message}, status=400)

        # Update Django user's password securely.
        user.set_password(new_password)
        user.save(update_fields=['password'])

        # Keep Mongo user in sync for existing auth flow.
        try:
            if bcrypt is None:
                logger.error("bcrypt dependency missing; skipping Mongo password sync for email=%s", email)
            else:
                password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                MongoUser.update(email, {'password': password_hash})
        except Exception:
            logger.exception("Mongo password sync failed for email=%s", email)

        # Delete OTP record after successful reset.
        record.delete()

        return JsonResponse({'message': 'Password reset successfully'})

    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)
