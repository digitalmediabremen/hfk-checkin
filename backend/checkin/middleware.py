from django.http import HttpResponse
import json
from django.utils.translation import gettext_lazy as _

# 404 JSON return

class JSON404Middleware(object):
    """
    Returns JSON 404 instead of HTML
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if response.status_code == 404 and 'application/json' not in response['content-type']:
            data = {'detail': '{0} not found'.format(request.path)}
            response = HttpResponse(json.dumps(data), content_type='application/json', status=404)

        if response.status_code == 500 and 'application/json' not in response['content-type']:
            data = {'detail': _('Es ist ein Fehler aufgetreten.').format(request.path)}
            response = HttpResponse(json.dumps(data), content_type='application/json', status=500)

        return response

# translation

from django.conf import settings
from django.middleware.locale import LocaleMiddleware
from django.utils import translation

def get_language_from_request_monkey_patched(request, check_path=False):
    if check_path:
        lang_code = translation._trans.get_language_from_path(request.path_info)
        if lang_code is not None:
            return lang_code

    supported_lang_codes = translation._trans.get_languages()

    if hasattr(request, 'session'):
        lang_code = request.session.get(translation.LANGUAGE_SESSION_KEY)
        if lang_code in supported_lang_codes and lang_code is not None and translation._trans.check_for_language(lang_code):
            return lang_code

    lang_code = request.COOKIES.get(settings.LANGUAGE_COOKIE_NAME)

    try:
        return translation._trans.get_supported_language_variant(lang_code)
    except LookupError:
        pass

    accept = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
    for accept_lang, unused in translation._trans.parse_accept_lang_header(accept):
        if accept_lang == '*':
            break

        if not translation._trans.language_code_re.search(accept_lang):
            continue

        try:
            return translation._trans.get_supported_language_variant(accept_lang)
        except LookupError:
            continue

    try:
        # NOTE:
        # Below line is a place to set fallback language
        # return translation._trans.get_supported_language_variant(YOUR_FALLBACK_LANGUAGE)
        # For English:
        return translation._trans.get_supported_language_variant(getattr(settings, 'LANGUAGE_FALLBACK', 'en'))
    except LookupError:
        return settings.LANGUAGE_CODE


class CustomFallbackLocaleMiddleware(LocaleMiddleware):
    def process_request(self, request):
        # NOTE: monkey patching get_language_from_request
        translation._trans.get_language_from_request = get_language_from_request_monkey_patched

        super(CustomFallbackLocaleMiddleware, self).process_request(request)