from __future__ import unicode_literals
from django.contrib import admin
from django.db import models
from django.contrib.admin import ModelAdmin
from django.utils.translation import gettext_lazy as _
from guardian.shortcuts import get_user_obj_perms_model
from .list_filters import UserFilter
from ..models.resource import Resource
from admin_auto_filters.filters import AutocompleteFilter
from django.utils import timezone
from django.utils.safestring import mark_safe
from django.urls import reverse

UserPermission = get_user_obj_perms_model()
PERMISSION_CODENAMES = ('resource:has_permanent_access', 'resource:can_modify_access')

class ResourceFilter(admin.SimpleListFilter):
    title = _("Resource")
    field_name = 'content_object'
    parameter_name = 'content_object'

    def lookups(self, request, model_admin):
        resource_permissions = UserPermission.objects.filter(permission__codename__in=PERMISSION_CODENAMES).distinct('object_pk')
        permitted_resources = Resource.objects.filter(pk__in=[r.object_pk for r in resource_permissions])
        return [(r.pk, r.display_name) for r in permitted_resources]

    def queryset(self, request, queryset):
        if not self.value():
            return queryset
        return queryset.filter(object_pk=self.value())


class KeycardListFilter(admin.SimpleListFilter):
    # Human-readable title which will be displayed in the
    # right admin sidebar just above the filter options.
    title = _('Keycard number')

    # Parameter for the filter that will be used in the URL query.
    parameter_name = 'keycard_number'

    def lookups(self, request, model_admin):
        """
        Returns a list of tuples. The first element in each
        tuple is the coded value for the option that will
        appear in the URL query. The second element is the
        human-readable name for the option that will appear
        in the right sidebar.
        """
        return (
            ('assigned', _('assigned')),
            ('unassigned', _('not assigned')),
        )

    def queryset(self, request, queryset):
        """
        Returns the filtered queryset based on the value
        provided in the query string and retrievable via
        `self.value()`.
        """
        # Compare the requested value (either '80s' or '90s')
        # to decide how to filter the queryset.
        if self.value() == 'assigned':
            return queryset.filter(user__profile__keycard_number__isnull=False)
        if self.value() == 'unassigned':
            return queryset.filter(user__profile__keycard_number__isnull=True)


class SyncedListFilter(admin.SimpleListFilter):
    # Human-readable title which will be displayed in the
    # right admin sidebar just above the filter options.
    title = _('Synced state')

    # Parameter for the filter that will be used in the URL query.
    parameter_name = 'synced'

    def lookups(self, request, model_admin):
        """
        Returns a list of tuples. The first element in each
        tuple is the coded value for the option that will
        appear in the URL query. The second element is the
        human-readable name for the option that will appear
        in the right sidebar.
        """
        return (
            ('yes', _('already synced')),
            ('no', _('not synced')),
        )

    def queryset(self, request, queryset):
        """
        Returns the filtered queryset based on the value
        provided in the query string and retrievable via
        `self.value()`.
        """
        # Compare the requested value (either '80s' or '90s')
        # to decide how to filter the queryset.
        if self.value() == 'yes':
            return queryset.filter(synced_at__isnull=False)
        if self.value() == 'no':
            return queryset.filter(synced_at__isnull=True)


class ResourcePermission(UserPermission):

    class Meta:
        proxy = True
        verbose_name = _("Resource access permission")
        verbose_name_plural = _("Resource access permissions")
        default_permissions = ('view',)

    # def __str__(self):
    #     return _("%(profile)s on %(date)s for reservation %(reservation)s") % \
    #            {'profile': self.user, 'date': self.reservation.display_duration, 'reservation': self.reservation}


def mark_as_synced_to_locking_system(modeladmin, request, queryset):
    queryset.update(synced_at=timezone.now())
mark_as_synced_to_locking_system.short_description = _("Mark selected permissions as synced to the locking system")


class AccessPermissionAdmin(ModelAdmin):
    # list_editable = ('synced_at',)
    list_display = ('get_first_name', 'get_last_name', 'get_keycard_number', 'get_resource', 'get_permission_name', 'modified_at', 'synced_at')
    # readonly_fields = (
    # 'user', 'content_object', 'modified_at')
    readonly_fields = ('userprofile_link', 'email_link', 'get_first_name', 'get_last_name', 'get_keycard_number', 'get_student_number', 'get_email', 'get_resource','get_permission_name', 'modified_at', 'synced_at')
    fields = readonly_fields
    list_display_links = ('get_first_name', 'get_last_name', 'get_resource')
    list_filter = (KeycardListFilter, SyncedListFilter, UserFilter, ResourceFilter)
    search_fields = ('user__first_name', 'user__last_name',)
    actions = [mark_as_synced_to_locking_system]

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        qs = qs.filter(permission__codename__in=PERMISSION_CODENAMES)
        return qs

    def userprofile_link(self, obj):
        if obj.user and obj.user.profile:
            # with profile
            change_url = reverse('admin:users_profile_change', args=(obj.user.profile.id,))
            return mark_safe('<a href="%s">%s</a>' % (
                change_url,
                obj.user.profile.get_full_name()
            ))
        else:
            # without profile
            change_url = reverse('admin:users_user_change', args=(obj.user.id,))
            return mark_safe('<a href="%s">%s</a>' % (change_url, obj.user))
    userprofile_link.short_description = _('Profile')

    def email_link(self, obj):
        return mark_safe('<a href="%s">%s</a>' % (
            "mailto:%s" % obj.user.profile.get_email_notation(),
            obj.user.email
        ))
    email_link.short_description = _('Send email')

    def get_first_name(self, obj):
        return obj.user.first_name
    get_first_name.short_description = _("First name")
    get_first_name.admin_order_field = ('user__first_name')

    def get_last_name(self, obj):
        return obj.user.last_name
    get_last_name.short_description = _("Last name")
    get_last_name.admin_order_field = ('user__last_name')

    def get_keycard_number(self, obj):
        if hasattr(obj.user, "profile"):
            return obj.user.profile.keycard_number
    get_keycard_number.short_description = _("Keycard number")
    get_keycard_number.admin_order_field = ('user__profile__keycard_number')

    def get_student_number(self, obj):
        if hasattr(obj.user, "profile"):
            return obj.user.profile.student_number
    get_student_number.short_description = _("Student number")
    get_student_number.admin_order_field = ('user__profile__student_number')

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = _("Email")
    get_email.admin_order_field = ('user__email')

    def get_resource(self, obj):
        return obj.content_object
    get_resource.short_description = _("Resource")
    get_resource.admin_order_field = ('conent_object')

    def get_permission_name(self, obj):
        return _(obj.permission.name)
    get_permission_name.short_description = _("Permission")
    get_permission_name.admin_order_field = ('permission__codename')

admin.site.register(ResourcePermission, AccessPermissionAdmin)