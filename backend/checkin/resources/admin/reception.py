from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import make_naive
from rangefilter.filter import DateTimeRangeFilter
from django.utils.timezone import now
from django.shortcuts import redirect
from django.utils.http import urlencode
from .reservation import Reservation
from django.core.exceptions import PermissionDenied
from urllib.parse import urlparse
from django.shortcuts import redirect

from django.conf import settings
if 'checkin.tracking' in settings.INSTALLED_APPS:
    from checkin.tracking.models import Checkin, Origin as CheckinOrigin
    from checkin.tracking.models import Location as CheckinLocation
    from ..models.attendance import Attendance, CheckinAttendance

    class AttendanceCheckinAdmin(admin.ModelAdmin):
        autocomplete_fields = ('profile','location')
        readonly_fields = ('get_reservation_organizer','get_reservation_resource',)
        fields = (*readonly_fields,)

        def get_reservation_organizer(self, obj):
            return ", ".join([r.organizer for r in obj.reservation_set.all()])
        get_reservation_organizer.short_description = _("Organizer")

        def get_reservation_resource(self, obj):
            return ", ".join([r.resource for r in obj.reservation_set.all()])
        get_reservation_resource.short_description = _("Space")


    class AttendanceAdmin(admin.ModelAdmin):
        list_display = ('user', 'reservation', 'get_is_external_user', 'state', 'comment')
        list_filter = ('state',)
        list_editable = ('state','comment')
        readonly_fields = ('user', 'reservation', 'get_reservation_organizer','get_reservation_resource',)
        fields = (*readonly_fields, 'state', 'comment',)

        def get_reservation_organizer(self, obj):
            return obj.reservation.organizer
        get_reservation_organizer.short_description = _("Organizer")

        def get_reservation_resource(self, obj):
            return obj.reservation.resource
        get_reservation_resource.short_description = _("Space")

        def get_is_external_user(self, obj):
            return obj.reservation.user.is_external
        get_is_external_user.short_description = _("External")
        get_is_external_user.boolean = True


    class ExternalAttendanceAdmin(AttendanceAdmin):
        pass


    class CheckinInline(admin.TabularInline):
        model = Checkin
        fields = ('time_entered', 'origin_entered', 'time_left', 'origin_left') # 'time_entered',
        readonly_fields = ('origin_entered', 'origin_left')
        extra = 0
        verbose_name = _("Attendance record")
        verbose_name_plural = _("Attendance records")


    from django.utils.html import format_html
    from django.urls import reverse, path

    class CheckinAttendanceAdmin(AttendanceAdmin):
        inlines = [CheckinInline]
        readonly_fields = (*AttendanceAdmin.readonly_fields, 'state','comment')
        list_editable = ()
        #list_display = ('user', 'resource', 'get_begin_time','enter_action','get_end_time','leave_action','comment','state')
        list_display = ['user', 'resource','reservation','get_display_duration','enter_action','leave_action','comment','state']
        list_filter = ('state','reservation__resource__unit',#'reservation__resource__unit',#ReservationResourceFilter,
                       # 'resources', 'start', 'end', 'status', 'is_important',
                       ('reservation__begin', DateTimeRangeFilter),
                       ('reservation__end', DateTimeRangeFilter),
                       )
        search_fields = ('reservation__uuid','user__first_name', 'user__last_name', 'user__email','reservation__resource__name','reservation__resource__numbers')
        date_hierarchy = 'reservation__begin'
        actions_on_top = True
        #list_display_links = ('user','resource')

        def get_queryset(self, request):
            qs = super().get_queryset(request).prefetch_related('checkin_set')
            #qs = qs.filter(state='requested')
            qs = qs.filter(reservation__state__in=(Reservation.CONFIRMED,))
            return qs

        def get_display_duration(self, obj):
            return obj.reservation.display_duration
        get_display_duration.short_description = _("Timespan")
        get_display_duration.admin_order_field = 'reservation__begin'

        def get_begin_time(self, obj):
            return format_html("<strong>{}</strong>", make_naive(obj.reservation.begin, obj.reservation.resource.get_tz()).time().strftime("%H:%M"))
        get_begin_time.short_description = _("Begin")
        get_begin_time.allow_tags = True
        get_begin_time.admin_order_field = 'reservation__begin'

        def get_end_time(self, obj):
            return format_html("<strong>{}</strong>", make_naive(obj.reservation.end, obj.reservation.resource.get_tz()).time().strftime("%H:%M"))
        get_end_time.short_description = _("End")
        get_end_time.allow_tags = True
        get_begin_time.admin_order_field = 'reservation__end'

        def get_urls(self):
            urls = super().get_urls()
            info = self.model._meta.app_label, self.model._meta.model_name
            custom_urls = [
                path(
                    r'<uuid:uuid>/checkin/',
                    self.admin_site.admin_view(self.process_checkin),
                    name='%s_%s_checkin' % info,
                ),
                path(
                    r'<uuid:uuid>/checkout/',
                    self.admin_site.admin_view(self.process_checkout),
                    name='%s_%s_checkout' % info,
                ),
            ]
            return custom_urls + urls

        def get_list_display(self, request):
            # remove registration fields from list_display for users without permission
            list_display = list(self.list_display)
            if not request.user.has_perm('attendance_can_register_attendance'):
                if 'enter_action' in list_display:
                    list_display.remove('enter_action')
                if 'leave_action' in list_display:
                    list_display.remove('leave_action')
            return list_display

        def enter_leave_action(self, obj, checkin_field, btn_label, url):
            try:
                # FIXME optimize query on db level
                last = obj.checkin_set.first()
                if last:
                    record = getattr(last, checkin_field)
                    if record is not None:
                        return make_naive(record, obj.reservation.resource.get_tz()).time()
            except (IndexError, Checkin.DoesNotExist):
                pass
            if obj.reservation.resource.checkinlocation:
                info = self.model._meta.app_label, self.model._meta.model_name
                return format_html(
                    '<a class="button" href="{}" style="color:white">{}</a>',
                    reverse(url % info, args=[obj.pk]),
                    btn_label,
                )
            # No CheckinLocation for this Resource. Can not checkin then.
            return None

        def enter_action(self, obj):
            return self.enter_leave_action(obj, 'time_entered', _('Record enter'), 'admin:%s_%s_checkin')
        enter_action.short_description = _('Enter')
        enter_action.allow_tags = True

        def leave_action(self, obj):
            return self.enter_leave_action(obj, 'time_left', _('Record leave'), 'admin:%s_%s_checkout')
        leave_action.short_description = _('Leave')
        leave_action.allow_tags = True

        def process_checkin(self, request, uuid, *args, **kwargs):
            if not request.user.has_perm('attendance_can_register_attendance'):
                raise PermissionDenied
            # FIXME reverse-relation zwischen Resource und Location/Checkin fehlt.
            # c = Checkin(location_id=5, origin=Checkin.FRONTDESK_MANUAL)
            # c.save()
            attendance = self.model.objects.get(uuid=uuid)
            # attendance.checkin_set.add(c)
            #location = attendance.reservation.resource.location_set.all()
            # FIXME will fail without CheckinLocation
            location = CheckinLocation.objects.get(resource=attendance.reservation.resource)
            checkin, new = attendance.checkin_set.checkin(profile=attendance.user, location=location, origin=CheckinOrigin.FRONTDESK_MANUAL, include_ancestors=False)
            checkin = attendance.checkin_set.add(checkin)
            attendance.save()
            return self._redirect_after_record(request)

        def process_checkout(self, request, uuid, *args, **kwargs):
            if not request.user.has_perm('attendance_can_register_attendance'):
                raise PermissionDenied
            attendance = self.model.objects.get(uuid=uuid)
            try:
                last_checkin = attendance.checkin_set.order_by('time_entered')[0]
                last_checkin.checkout(origin=CheckinOrigin.FRONTDESK_MANUAL, include_descendants=False)
            except (IndexError, KeyError):
                pass
            return self._redirect_after_record(request)

        def _redirect_after_record(self, request):
            info = self.model._meta.app_label, self.model._meta.model_name
            if 'HTTP_REFERER' in request.META:
                query_params = urlparse(request.META['HTTP_REFERER']).query
                if query_params:
                    return redirect(reverse('admin:%s_%s_changelist' % info) + '?' + query_params)
            return redirect(reverse('admin:%s_%s_changelist' % info))

        def changelist_view(self, request, extra_context=None):
            if request.GET:
                return super().changelist_view(request, extra_context=extra_context)

            date = now().date()
            params = ['day', 'month', 'year']
            field_keys = ['{}__{}'.format(self.date_hierarchy, i) for i in params]
            field_values = [getattr(date, i) for i in params]
            query_params = dict(zip(field_keys, field_values))
            url = '{}?{}'.format(request.path, urlencode(query_params))
            return redirect(url)



    admin.site.register(Attendance, ExternalAttendanceAdmin)
    # admin.site.register(AttendanceCheckin, AttendanceCheckinAdmin)
    admin.site.register(CheckinAttendance, CheckinAttendanceAdmin)