from django.contrib import admin
from ..models import Profile
from django.utils import timezone
from django.utils.translation import gettext, ngettext, gettext_lazy as _
from guardian.shortcuts import get_user_obj_perms_model
from django.utils.html import format_html
from django.contrib import messages
from django.utils.safestring import mark_safe
from checkin.resources.models.utils import join_email_list
from django.db.models import Q
from django.urls import reverse

#from checkin.resources.admin.permission import PERMISSION_CODENAMES as KEYCARD_PERMISSION_CODENAMES
KEYCARD_PERMISSION_CODENAMES = ('resource:has_permanent_access', 'resource:can_modify_access')

UserPermission = get_user_obj_perms_model()

class Keycard(Profile):

    class Meta:
        proxy = True # if not proxy anymore: move to separate app!
        verbose_name = _("Keycard")
        verbose_name_plural = _("Keycards")
        default_permissions = ('view','change')


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
            ('requested', _('requested and not yet assigned')),
            ('requestedandassigned', _('requested and assigned')),
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
            return queryset.filter(keycard_number__isnull=False)
        if self.value() == 'unassigned':
            return queryset.filter(keycard_number__isnull=True)
        if self.value() == 'requested':
            return queryset.filter(keycard_requested_at__isnull=False,keycard_number__isnull=True)
        if self.value() == 'requestedandassigned':
            return queryset.filter(keycard_requested_at__isnull=False,keycard_number__isnull=False)
        if self.value() == 'pending':
            return queryset.filter(Q(keycard_number__isnull=False) | Q(keycard_requested_at__isnull=False,keycard_number__isnull=True))


class KeycardAdmin(admin.ModelAdmin):
    # list_editable = ('synced_at',)
    list_display = ('keycard_number', 'first_name', 'last_name', 'email', 'get_keycard_status', 'get_sync_status', 'get_permissions_link')
    # readonly_fields = (
    # 'user', 'content_object', 'modified_at')
    fields = ('first_name', 'last_name', 'email', 'keycard_number', 'keycard_requested_at')
    readonly_fields = ('first_name', 'last_name', 'email')
    # ordering = ('user__profile__keycard_number', 'user__last_name')
    list_display_links = ('keycard_number', 'first_name', 'last_name')
    # list_filter = (KeycardListFilter, SyncedListFilter, UserFilter, ResourceFilter)
    list_filter = (KeycardListFilter,'keycard_requested_at',)
    search_fields = ('keycard_number', 'first_name', 'last_name', 'email', 'user__first_name', 'user__last_name',)
    actions = ['action_email_users']

    def action_email_users(self, request, queryset):
        emails = []
        for permission in queryset:
            emails.append(permission.user.get_email_notation())
        emails = set(emails)
        self.message_user(request,
                          mark_safe(format_html("{} <a href='mailto:{}'>{}</a>",
                                                _("%(num_recipients)d users selected:") % {
                                                    'num_recipients':  len(emails),
                                                },
                                                join_email_list(emails),
                                                _("Open new email")
                          )), messages.WARNING)
    action_email_users.short_description = _('Email selected users')

    def has_delete_permission(self, request, obj=None):
        return False

    # def has_change_permission(self, request, obj=None):
    #     return False

    def has_add_permission(self, request):
        return False

    def get_queryset(self, request):
        qs = super().get_queryset(request).prefetch_related('user__timeenableduserobjectpermission_set')
        qs = qs.filter(Q(keycard_number__isnull=False) | Q(keycard_requested_at__isnull=False))
        return qs

    def get_keycard_status(self, obj):
        if obj.keycard_number is None and obj.keycard_requested_at:
            return _("Keycard requested")
        if obj.keycard_number:
            return _("Keycard assigned")
    get_keycard_status.short_description = _("Keycard status")

    def get_sync_status(self, obj):
        obj.assigned_permissions = obj.user.timeenableduserobjectpermission_set.filter(permission__codename__in=KEYCARD_PERMISSION_CODENAMES)
        if len(obj.assigned_permissions) < 1:
            return _("No permissions assigned")
        synced_permissions = 0
        not_synced_permissions = 0
        for permission in obj.assigned_permissions:
            if permission.synced_at is None:
                not_synced_permissions += 1
            else:
                synced_permissions += 1
        value = ""
        if not_synced_permissions > 0:
            value += ngettext("%d permission to sync", "%d permissions to sync", not_synced_permissions) % not_synced_permissions
            value += ", "
        value += ngettext("%d synced permission", "%d synced permissions", synced_permissions) % synced_permissions
        return value
    get_sync_status.short_description = _("Permission sync status")

    def get_permissions_link(self, obj):
        obj.assigned_permissions = obj.user.timeenableduserobjectpermission_set.filter(permission__codename__in=KEYCARD_PERMISSION_CODENAMES)
        change_url = reverse('admin:resources_resourcepermission_changelist') + '?user__pk__exact=%s' % obj.user.id
        perm_count = len(obj.assigned_permissions)
        return mark_safe('<a href="%s">%s</a>' % (change_url, ngettext("Show %d permission", "Show %d permissions", perm_count) % perm_count))
    get_permissions_link.short_description = _("Permissions")

admin.site.register(Keycard, KeycardAdmin)