from django.contrib import admin
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin
from django.utils.translation import ugettext_lazy as _
from rangefilter.filter import DateRangeFilter, DateTimeRangeFilter

from .models import *

class GuestInline(admin.TabularInline):
    model = GuestInRoomBooking
    #readonly_fields = ('updated_at',)

class RoomAccessPolicyInline(admin.StackedInline):
    autocomplete_fields = ('person',)
    model = RoomAccessPolicy
    readonly_fields = ('updated_at',)
    extra = 0

class RoomAdmin(admin.ModelAdmin, DynamicArrayMixin):
    autocomplete_fields = ('access_delegates','booking_delegates')
    inlines = [RoomAccessPolicyInline]
    search_fields = ('numbers','name')
    list_display = ('display_numbers', 'name', 'bookable', 'updated_at')
    #see Tracking.Location for other list_display

    # def get_urls(self):
    #     urls = super().get_urls()
    #     custom_urls = [
    #         path('evaluate/', self.admin_site.admin_view(case_evaluation_view), name='checkin-evaluation'),
    #     ]
    #     return custom_urls + urls

class RoomAccess(Room):
    class Meta:
        proxy = True
        verbose_name = _("Zugangsberechtigungen")
        verbose_name_plural = _("Zugangsberechtigungen zu Räumen")

class RoomAccessAdmin(RoomAdmin):
    autocomplete_fields = ('delegates',)
    inlines = [RoomAccessPolicyInline]
    fields = ('name','numbers','delegates')
    readonly_fields = fields
    list_display = RoomAdmin.list_display


admin.site.register(RoomAccess,RoomAccessAdmin)
admin.site.register(Room,RoomAdmin)



class AttendanceInline(admin.TabularInline):
    autocomplete_fields = ('person',)
    model = Attendance
    readonly_fields = ('updated_at',)
    extra = 0

class RoomBookingRequestAdmin(admin.ModelAdmin):
    inlines = [AttendanceInline]
    readonly_fields = ('attendants','number_of_attendants','uuid')
    autocomplete_fields = ('rooms','organizer')
    # TODO display full_names instead of ID / __str__ of profile (if user has permission to do so)
    list_display = ['short_uuid', 'organizer', 'rooms_display', 'start', 'end', 'number_of_attendants', 'is_important', 'status']
    list_filter = ('rooms','start','end', 'status','is_important',
                   ('created_at', DateRangeFilter),
                   ('updated_at', DateTimeRangeFilter),)
    inlines = [GuestInline]

    def rooms_display(self, object):
        return ", ".join([r.display_name for r in object.rooms.all()])
    rooms_display.short_description = _("Raum")

admin.site.register(RoomBookingRequest,RoomBookingRequestAdmin)


class ReservationAttendance(RoomBookingRequest):
    class Meta:
        proxy = True
        verbose_name = _("Teilnahmelisten und -berechtigungen")
        verbose_name_plural = _("Teilnahmelisten und -berechtigungen zu Buchungen")

class ReservationAttendanceAdmin(RoomBookingRequestAdmin):
    inlines = [AttendanceInline]
    fields = ('uuid','organizer','rooms')
    readonly_fields = fields
    list_display = RoomBookingRequestAdmin.list_display

admin.site.register(ReservationAttendance,ReservationAttendanceAdmin)