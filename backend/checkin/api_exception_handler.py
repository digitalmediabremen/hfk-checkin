from rest_framework.views import exception_handler
from django.utils.translation import ugettext_lazy as _
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    logger.debug("API exception: %s" % str(exc), exc_info=True)
    response = exception_handler(exc, context)

    # Update the structure of the response data.
    if response is not None:
        customized_response = {}
        # always return details field
        if response.status_code == 400:
            customized_response['detail'] = _('Bad request')
        else:
            customized_response['detail'] = _('An error occurred')
        # add original exception for debugging
        customized_response['exception'] = str(exc)
        # add validation errors (or similar) to errors
        customized_response['errors'] = []

        i = 0
        error_summary = ""
        for key, value in response.data.items():
            error = {key: value}
            customized_response['errors'].append(error)
            error_summary += "%i. %s" % (i+1, str(value))
            i += 1

        if i == 1:
            customized_response['detail'] = error_summary

        if i > 1:
            customized_response['detail'] = _('Multiple errors:') + " " + error_summary

        response.data = customized_response

    return response