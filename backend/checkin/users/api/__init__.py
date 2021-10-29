# use absolute imports in __init__.py
# otherwise tests will not work

from checkin.users.api.user import *
from checkin.users.api.base import all_views
from checkin.users.api.keycard import KeycardViewSet
