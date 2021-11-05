# use absolute imports in __init__.py
# otherwise tests will not work

from checkin.users.models.userprofile import (
    Profile, User, UserManager, ProfileManager, validate_min_length_or_None
)

from checkin.users.models.keycard import Keycard