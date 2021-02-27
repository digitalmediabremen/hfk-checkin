from rest_framework.views import exception_handler
from django.utils.translation import ugettext_lazy as _

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Update the structure of the response data.
    if response is not None:
        customized_response = {}
        # always return details field
        if response.status_code == 400:
            customized_response['detail'] = _('Bad request')
        else:
            customized_response['detail'] = _('An error occurred')
        # add validation errors (or similar) to errors
        customized_response['errors'] = []

        for key, value in response.data.items():
            error = {key: value}
            customized_response['errors'].append(error)

        response.data = customized_response

    return response