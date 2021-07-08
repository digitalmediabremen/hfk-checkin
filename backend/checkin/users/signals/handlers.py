from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
from django.utils.translation import get_language_from_request

@receiver(user_logged_in)
def user_logged_in_callback(sender, request, user, **kwargs):
    # update users language on next login if it has not been set yet
    if user and user.preferred_language is None:
        user.preferred_language = get_language_from_request(request)
        user.save()