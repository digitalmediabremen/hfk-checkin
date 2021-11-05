from django.contrib.admin import site as admin_site
from django.contrib import admin
from modeltranslation.admin import TranslationAdmin

# use absolute imports in __init__.py
# otherwise tests will not work

from checkin.users.admin.userprofile import *