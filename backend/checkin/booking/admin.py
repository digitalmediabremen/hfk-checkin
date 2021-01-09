from django.contrib import admin
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin

from .models import *

class RoomAccessPolicyInline(admin.TabularInline):
    model = RoomAccessPolicy
    readonly_fields = ('updated_at',)

class RoomAdmin(admin.ModelAdmin, DynamicArrayMixin):
    autocomplete_fields = ('delegates',)
    inlines = [RoomAccessPolicyInline]

admin.site.register(Room,RoomAdmin)

class RoomBookingRequestAdmin(admin.ModelAdmin):
    readonly_fields = ('attendants','number_of_attendants')

admin.site.register(RoomBookingRequest,RoomBookingRequestAdmin)