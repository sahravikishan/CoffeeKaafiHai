import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives


logger = logging.getLogger(__name__)
BRAND_NAME = "CoffeeKaafiHai"


def render_email_template(
    *,
    title,
    message,
    code=None,
    meta_lines=None,
    footer_note=None,
    cta_label=None,
    cta_url=None,
    header_subtitle="Secure Notification"
):
    """
    Reusable HTML email layout shared across OTP and notification emails.
    """
    meta_lines = meta_lines or []
    footer_note = footer_note or f"If you didn't request this from {BRAND_NAME}, you can safely ignore this email."

    code_block = ""
    if code:
        code_block = f'<div style="font-size:30px; letter-spacing:8px; font-weight:700; color:#1f1a16; background:#f5eee6; padding:14px 18px; border-radius:10px; text-align:center; margin:6px 0 10px;">{code}</div>'

    meta_html = ""
    if meta_lines:
        meta_html = "".join(f'<p style="margin:0 0 4px; color:#7a6a5a; font-size:13px; line-height:1.5;">{line}</p>' for line in meta_lines)

    cta_html = ""
    if cta_label and cta_url:
        cta_html = f'<div style="margin:16px 0 4px;"><a href="{cta_url}" style="display:inline-block; background:#1f1a16; color:#ffffff; text-decoration:none; padding:10px 18px; border-radius:10px; font-size:14px; letter-spacing:0.2px;">{cta_label}</a></div>'

    html_message = f'<div style="font-family:Arial,sans-serif; background:#f6f0e9; padding:28px;"><div style="max-width:540px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 28px rgba(31,26,22,0.12);"><div style="padding:24px; background:linear-gradient(135deg,#1f1a16 0%,#3a2f28 100%); text-align:center;"><div style="width:84px; height:84px; margin:0 auto 6px; border-radius:50%; background:#ffffff; box-shadow:0 6px 18px rgba(0,0,0,0.18); text-align:center; line-height:84px;"><span style="display:inline-block; vertical-align:middle; font-size:28px;">&#9749;</span></div><h2 style="margin:-8px 0 0; color:#ffffff; font-size:20px; letter-spacing:0.5px;">{BRAND_NAME}</h2><p style="margin:6px 0 0; color:#e6ddd6; font-size:13px;">{header_subtitle}</p></div><div style="padding:26px 24px;"><h3 style="margin:0 0 10px; color:#1f1a16; font-size:18px; line-height:1.4;">{title}</h3><p style="margin:0 0 14px; color:#4a3f35; font-size:14px; line-height:1.5;">{message}</p>{code_block}{cta_html}{meta_html}</div><div style="padding:16px 24px; background:#f3ece4; color:#7a6a5a; font-size:12px; text-align:center;">{footer_note}</div></div></div>'

    return html_message


def send_templated_email(
    *,
    recipient,
    subject,
    text_message,
    title=None,
    message=None,
    code=None,
    meta_lines=None,
    footer_note=None,
    cta_label=None,
    cta_url=None,
    header_subtitle="Secure Notification",
    html_message=None
):
    """
    Send a branded HTML email with a plain-text fallback.
    Returns (ok: bool, reason: str|None).
    """
    if not recipient:
        return False, "missing_email"

    from_email_value = (
        getattr(settings, 'DEFAULT_FROM_EMAIL', None)
        or getattr(settings, 'EMAIL_HOST_USER', None)
        or ''
    ).strip()
    if not from_email_value:
        logger.error(
            "Email sender is not configured for subject=%s recipient=%s",
            subject,
            recipient,
        )
        return False, "sender_not_configured"

    from_email = f"{BRAND_NAME} <{from_email_value}>"
    resolved_html = html_message or render_email_template(
        title=title or subject,
        message=message or text_message,
        code=code,
        meta_lines=meta_lines,
        footer_note=footer_note,
        cta_label=cta_label,
        cta_url=cta_url,
        header_subtitle=header_subtitle,
    )

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_message,
            from_email=from_email,
            to=[recipient],
        )
        if resolved_html:
            email.attach_alternative(resolved_html, "text/html")
        email.send(fail_silently=False)
        return True, None
    except Exception as exc:
        logger.exception(
            "Email send failed subject=%s recipient=%s",
            subject,
            recipient,
        )
        return False, str(exc)
