from django.conf import settings
from django.conf.global_settings import *

def setting(key, default):
    return getattr(settings, key, default)

# RESPA_PAYMENTS_ENABLED = setting('RESPA_PAYMENTS_ENABLED', False)
# # Dotted path to the active payment provider class, see payments.providers init.
# # Example value: 'payments.providers.BamboraPayformProvider'
# RESPA_PAYMENTS_PROVIDER_CLASS = setting('RESPA_PAYMENTS_PROVIDER_CLASS', None)
# # amount of minutes before orders in state "waiting" will be set to state "expired"
# RESPA_PAYMENTS_PAYMENT_WAITING_TIME = setting('RESPA_PAYMENTS_PAYMENT_WAITING_TIME')
# RESPA_PAYMENTS_PAYMENT_REQUESTED_WAITING_TIME = setting('RESPA_PAYMENTS_PAYMENT_REQUESTED_WAITING_TIME')

ENABLE_RESOURCE_TOKEN_AUTH = setting('ENABLE_RESOURCE_TOKEN_AUTH', False)
RESPA_PAYMENTS_ENABLED = setting('RESPA_PAYMENTS_ENABLED', False) and 'payments' in settings.INSTALLED_APPS