import os
import sys
from pathlib import Path
import django

# Ensure backend/ is on sys.path so config.settings can be imported
BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from database.mongo import get_database


def main():
    user_model = get_user_model()
    db = get_database()
    mongo_users = list(db['users'].find({}))

    created = 0
    skipped = 0
    errors = 0

    for u in mongo_users:
        email = (u.get('email') or '').strip().lower()
        if not email:
            skipped += 1
            continue

        if user_model.objects.filter(username=email).exists() or user_model.objects.filter(email=email).exists():
            skipped += 1
            continue

        try:
            django_user = user_model.objects.create_user(username=email, email=email)
            django_user.first_name = u.get('firstName', '') or ''
            django_user.last_name = u.get('lastName', '') or ''
            django_user.set_unusable_password()
            django_user.save()
            created += 1
        except Exception:
            errors += 1

    print(f"Mongo users: {len(mongo_users)}")
    print(f"Created Django users: {created}")
    print(f"Skipped (existing/invalid): {skipped}")
    print(f"Errors: {errors}")


if __name__ == '__main__':
    main()
