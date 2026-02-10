import json
import random
from datetime import timedelta
from zoneinfo import ZoneInfo

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import PasswordResetOTP
from database.models import User as MongoUser
import bcrypt


OTP_EXPIRY_MINUTES = getattr(settings, 'PASSWORD_RESET_OTP_EXPIRY_MINUTES', 5)
OTP_MAX_ATTEMPTS = getattr(settings, 'PASSWORD_RESET_OTP_MAX_ATTEMPTS', 5)


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
    from_name = getattr(settings, 'EMAIL_FROM_NAME', 'CoffeeKaafiHai')
    from_email_value = (
        getattr(settings, 'DEFAULT_FROM_EMAIL', None)
        or getattr(settings, 'EMAIL_HOST_USER', None)
    )
    from_email = f"{from_name} <{from_email_value}>" if from_email_value else None

    text_message = (
        f"Your OTP is {otp}. It expires in {OTP_EXPIRY_MINUTES} minutes."
    )
    sent_at = timezone.localtime(
        timezone.now(),
        timezone=ZoneInfo('Asia/Kolkata')
    ).strftime('%a, %d/%m/%Y %I:%M %p')

    html_message = f"""
    <div style="font-family: Arial, sans-serif; background:#f6f0e9; padding:28px;">
      <div style="max-width:540px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 28px rgba(31,26,22,0.12);">
        <div style="padding:24px; background: linear-gradient(135deg, #1f1a16 0%, #3a2f28 100%); text-align:center;">
          <div style="width:84px; height:84px; margin:0 auto 6px; border-radius:50%; background:#ffffff; box-shadow:0 6px 18px rgba(0,0,0,0.18); text-align:center; line-height:84px;">
            <span style="display:inline-block; vertical-align:middle; font-size:28px;">☕</span>
          </div>
          <h2 style="margin:-8px 0 0; color:#ffffff; font-size:20px; letter-spacing:0.5px;">CoffeeKaafiHai</h2>
          <p style="margin:6px 0 0; color:#e6ddd6; font-size:13px;">Secure Password Reset</p>
        </div>
        <div style="padding:26px 24px;">
          <h3 style="margin:0 0 10px; color:#1f1a16; font-size:18px; line-height:1.4;">Your OTP Code</h3>
          <p style="margin:0 0 14px; color:#4a3f35; font-size:14px; line-height:1.5;">Use this one-time password to reset your account:</p>
          <div style="font-size:30px; letter-spacing:8px; font-weight:700; color:#1f1a16; background:#f5eee6; padding:14px 18px; border-radius:10px; text-align:center; margin:6px 0 10px;">
            {otp}
          </div>
          <p style="margin:0 0 4px; color:#7a6a5a; font-size:13px; line-height:1.5;">This OTP expires in {OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="margin:0; color:#7a6a5a; font-size:12px; line-height:1.4;">Sent at: {sent_at}</p>
        </div>
        <div style="padding:16px 24px; background:#f3ece4; color:#7a6a5a; font-size:12px; text-align:center;">
          If you didn’t request this, you can safely ignore this email.
        </div>
      </div>
    </div>
    """

    msg = EmailMultiAlternatives(subject, text_message, from_email, [email])
    msg.attach_alternative(html_message, "text/html")
    msg.send(fail_silently=False)


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
        except Exception as e:
            # Log SMTP error to server console for debugging.
            print(f"Password reset OTP email failed for {email}: {e}")
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
            password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            MongoUser.update(email, {'password': password_hash})
        except Exception as e:
            print(f"Mongo password sync failed for {email}: {e}")

        # Delete OTP record after successful reset.
        record.delete()

        return JsonResponse({'message': 'Password reset successfully'})

    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)
