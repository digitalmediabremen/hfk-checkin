from django.contrib import admin
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from django.utils.translation import ugettext_lazy as _

from .models import *

class RoomAccessPolicyInline(admin.TabularInline):
    model = RoomAccessPolicy
    readonly_fields = ('updated_at',)

class RoomAdmin(admin.ModelAdmin, DynamicArrayMixin):
    autocomplete_fields = ('delegates',)
    inlines = [RoomAccessPolicyInline]
    search_fields = ('numbers','name')
    list_display = ('display_numbers', 'name', 'bookable', 'updated_at')
    #see Tracking.Location for other list_display

admin.site.register(Room,RoomAdmin)

class RoomBookingRequestAdmin(admin.ModelAdmin):
    readonly_fields = ('attendants','number_of_attendants','uuid')
    autocomplete_fields = ('rooms','organizer','guests')
    # TODO display full_names instead of ID / __str__ of profile (if user has permission to do so)
    list_display = ['short_uuid', 'organizer', 'rooms_display', 'start', 'end', 'number_of_attendants', 'is_important', 'title']

    def rooms_display(self, object):
        return ", ".join([r.display_name for r in object.rooms.all()])
    rooms_display.short_description = _("Räume")

admin.site.register(RoomBookingRequest,RoomBookingRequestAdmin)