from rest_framework.views import exception_handler
from django.utils.translation import ugettext_lazy as _
from django.utils.translation import ngettext
from rest_framework.exceptions import ErrorDetail
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

ERROR_BAD_REQUEST = _('An error occurred. Your input might be not correct.')
ERROR_SERVER_ERROR = _('Sorry. An error occurred.')
ERROR_VALIDATION_ERROR = _('Please correct your input: %(error_list_str)s')
ERROR_GENERAL_ERROR = _('Error: %(error_list_str)s')
ERROR_BLANK_FIELD = _("'%(field_name)s' can not be blank.")

def str_or_errordetail_to_error_message(str_or_error_detail, field_name=None):
    if isinstance(str_or_error_detail, ErrorDetail) and str_or_error_detail.code == 'blank' and field_name:
        # blank field
        return ERROR_BLANK_FIELD % {'field_name': field_name}
    else:
        return str_or_error_detail

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
            customized_response['detail'] = ERROR_BAD_REQUEST
        else:
            customized_response['detail'] = ERROR_SERVER_ERROR
        if settings.DEBUG:
            # add original exception for debugging
            customized_response['exception'] = repr(exc)
        # add validation errors (or similar) to errors
        customized_response['errors'] = []

        #i = 0
        validation_errors = []
        general_errors = []
        print(response.data)
        for key, value in response.data.items():
            error = {key: value}
            customized_response['errors'].append(error)
            if isinstance(value, list):
                # list of errors on field
                for single_error in value:
                    validation_errors.append(str_or_errordetail_to_error_message(single_error, key))
            else:
                # general detail error (without field)
                general_errors.append(str_or_errordetail_to_error_message(value))

        if len(validation_errors) > 0:

            customized_response['detail'] = ngettext(
                ERROR_VALIDATION_ERROR,
                ERROR_VALIDATION_ERROR,
                len(validation_errors)) % {'error_list_str': ", ".join(validation_errors)}

        if len(general_errors) > 0:

            customized_response['detail'] = ngettext(
                ERROR_GENERAL_ERROR,
                ERROR_GENERAL_ERROR,
                len(general_errors)) % {'error_list_str': ", ".join(general_errors)}

        response.data = customized_response

    return response