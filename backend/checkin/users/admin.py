import random
import uuid
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import Group, GroupAdmin as DjangoGroupAdmin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import UsernameField
from django.contrib import admin
from django import forms
from django.utils.translation import gettext, gettext_lazy as _
from impersonate.admin import UserAdminImpersonateMixin
from simple_history.admin import SimpleHistoryAdmin
from django.urls import reverse
from django.shortcuts import redirect
from django.views.generic.base import RedirectView

from .models import Profile
User = get_user_model()


class UserCreationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ("email",)


class UserProfileAdminInline(admin.StackedInline):
    model = Profile
    extra = 0
    min = 0
    max = 1
    readonly_fields = ('keycard_requested_at',)


class UserAdmin(UserAdminImpersonateMixin, DjangoUserAdmin):
    open_new_window = True
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Additional info'), {'fields': ('preferred_language', 'disable_notifications')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_general_admin', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email',)#, 'password1', 'password2'),
        }),
    )
    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'disable_notifications', 'preferred_language', 'profile__is_external', 'profile__verified')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    add_form = UserCreationForm
    inlines = [UserProfileAdminInline]

    def has_view_permission(self, request, obj=None):
        info = self.model._meta.app_label, self.model._meta.model_name
        autocomplete_path = reverse('admin:%s_%s_autocomplete' % info)
        if request.path == autocomplete_path:
            # return True if request is from AutocompleteJsonView and user is_staff.
            return request.user.is_staff
        return super().has_view_permission(request, obj)

    def add_view(self, request, form_url='', extra_context=None):
        # redirect non-admin users (that have permission to change Users) to the add_view for Profile.
        # this along with the 'can_add_user' permission is needed to show the "+" icon next to a FK-relation on users
        if not self.has_change_permission(request):
            redirect = RedirectView.as_view(pattern_name='admin:users_profile_add', query_string=True)
            return redirect(request)
        return super().add_view(request, form_url, extra_context)

    def get_model_perms(self, request):
        # hide if only add_perm without change_perm
        return {
            'add': self.has_add_permission(request) and self.has_change_permission(request),
            'change': self.has_change_permission(request),
            'delete': self.has_delete_permission(request),
            'view': self.has_view_permission(request),
        }

    def get_queryset(self, request):
        qs = super().get_queryset(request).exclude_anonymous_users().filter_for_user(request.user)
        return qs

    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super().get_search_results(request, queryset, search_term)
        # filter to only non external users if requested for autocomplete field (e.g. in ReservationAdmin or PermissionInline)
        if '/autocomplete/' in request.path:
            queryset = queryset.filter(profile__is_external=False)
        return queryset, use_distinct


if not admin.site.is_registered(User):
    admin.site.register(User, UserAdmin)


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ('first_name', 'last_name','phone','email','student_number','verified','is_external')

    def validate_unique(self):
        super().validate_unique()
        email = self.cleaned_data['email']
        # validate email in advance to prevent IntegrityError later (via pre_save / post_save signal)
        obj = Profile.objects.filter(email=email).exclude(pk=self.instance.pk)
        if obj:
            self._update_errors(forms.ValidationError(_('Profile with this email is already exists. Try an another email.')))
        obj = User.objects.filter(email=email)
        if self.instance and self.instance.user:
            obj = obj.exclude(pk=self.instance.user.pk)
        if obj:
            self._update_errors(
                forms.ValidationError(_('User with this email is already exists. Try an another email.')))


@admin.register(Profile)
class ProfileAdmin(SimpleHistoryAdmin, admin.ModelAdmin):

    list_display = ('id','first_name', 'last_name','phone','email','verified','is_external','created_at')
    # ! overwritten by get_list_display to upgrade permission
    # readonly_fields = ('last_checkin',)
    # list_editable will be overwritten by get_list_editable
    _list_editable = ('verified','is_external')
    list_filter = ('updated_at','created_at','verified','is_external','user__disable_notifications', 'user__preferred_language',)
    search_fields = ['first_name', 'last_name','phone','email']
    readonly_fields = ('id','created_at','updated_at','user','keycard_requested_at')
    fields = ('id','first_name', 'last_name','phone','email','student_number','keycard_number','keycard_requested_at','verified','is_external','created_at','updated_at')
    form = ProfileForm

    def get_queryset(self, request):
        qs = super(ProfileAdmin, self).get_queryset(request).exclude_anonymous_users().filter_for_user(request.user)
        return qs

    def get_obfuscated_fields(self, request):
        '''
        Obfuscates fields to protect user data in ModelAdmin.

        :param request:
        :return: tuple(list of fields to obfuscate, list of new "fieldnames" that shall be used instead)
        '''
        fields = []
        # check permissions and determine which fields shall be obfuscated
        if not request.user.has_perm('users.can_view_real_names'):
            fields.append('first_name')
            fields.append('last_name')
        if not request.user.has_perm('users.can_view_full_email'):
            fields.append('email')
        if not request.user.has_perm('users.can_view_full_phone_number'):
            fields.append('phone')
        if not request.user.has_perm('users.can_view_student_number'):
            fields.append('student_number')

        # determine new attribute names to use instead of original fields
        attribute_name = '%s_obfuscated'
        new_field_names = list(range(len(fields)))
        for i, field in enumerate(fields):
            if hasattr(self, attribute_name % field):
                field = attribute_name % field
            else:
                # make obfuscate attribute
                obfuscator = lambda self, obj=None: _("Hidden value")
                obfuscator.short_description = self.model._meta.get_field(field).verbose_name
                setattr(self, attribute_name % field, obfuscator)
                field = attribute_name % field
                #field = 'get_default_obfuscated'

            new_field_names[i] = field
        return fields, new_field_names

    def get_readonly_fields(self, request, obj=None):
        obfuscated_fields, replaced_obfuscated_fields = self.get_obfuscated_fields(request)
        fields = list(set(self.readonly_fields) | set(replaced_obfuscated_fields))
        if request.user.is_superuser:
            fields.append('user')
        if request.user.has_perm('users.can_change_keycard_only') or request.user.has_perm('users.can_change_user_status_only'):
            fields = list(set(self.fields) | set(replaced_obfuscated_fields))
            if request.user.has_perm('users.can_change_keycard_only'):
                fields.remove('keycard_number')
            if request.user.has_perm('users.can_change_user_status_only'):
                fields.remove('verified')
                fields.remove('is_external')
        return fields

    def get_list_editable(self, request):
        """ return which fields are list editible depending on user """
        if request.user.has_perm('users.can_change_keycard_only'):
            # currently only "can_change_keycard_only" is restricting access to fields for users that have the "change"
            # permission.
            return None
        return self._list_editable

    def get_changelist_instance(self, request):
        """
        override admin method and list_editable property value
        with values returned by our custom method implementation.
        """
        self.list_editable = self.get_list_editable(request)
        return super().get_changelist_instance(request)

    def get_list_display(self, request):
        org_fields = super().get_list_display(request)
        obfuscated_fields, replaced_obfuscated_fields = self.get_obfuscated_fields(request)
        return self.get_replaced_obfuscated_fields(org_fields, obfuscated_fields, replaced_obfuscated_fields)

    def get_fields(self, request, obj=None):
        org_fields = super().get_fields(request, obj)
        if obj is None:
            # empty object / add view
            # show all fields for entry
            return org_fields
        obfuscated_fields, replaced_obfuscated_fields = self.get_obfuscated_fields(request)
        fields = list(self.get_replaced_obfuscated_fields(org_fields, obfuscated_fields, replaced_obfuscated_fields))
        if request.user.is_superuser:
            fields.append('user')
        return fields

    @staticmethod
    def get_replaced_obfuscated_fields(org_fields, obfuscated_fields, replaced_obfuscated_fields):
        fields = list(range(len(org_fields)))
        for i, field in enumerate(org_fields):
            try:
                # check if field is in obfuscated_fields and get index
                j = obfuscated_fields.index(field)
                # used replaced attribute name instead
                fields[i] = replaced_obfuscated_fields[j]
            except ValueError:
                # if value does not exist, field is not obfuscated
                fields[i] = field
        return fields

    def phone_obfuscated(self, object):
        if object.phone:
            try:
                m = object.phone
                return f'{m[0]}{m[1]}{m[2]}{m[3]}{m[4]}{"*" * (len(m) - 6)}{m[-1]}'
            except (IndexError, ValueError):
                return '***'
    phone_obfuscated.short_description = _("Telefonnummer")

    def email_obfuscated(self, object):
        if object.email:
            m = object.email.split('@')
            if len(m) is 2:
                return f'{m[0][0]}{m[0][1]}{"*" * (len(m[0]) - 2)}{m[0][-2]}{m[0][-1]}@{m[1]}'
            return f'{m[0][0]}{m[0][1]}{"*" * min((len(m[0]) - 2), 7)}'
    email_obfuscated.short_description = _("E-Mail Adresse")

    # def has_add_permission(self, request):
    #     return False
    # Needed to add person in bookingrequests (and paper entry)

class UserGroupInline(admin.StackedInline):
    model = get_user_model().groups.through
    autocomplete_fields = ('user',)
    verbose_name = _("Group membership")
    verbose_name_plural = _("Group memberships")
    extra = 0


class GroupAdmin(DjangoGroupAdmin):
    inlines = [UserGroupInline]


admin.site.unregister(Group)
admin.site.register(Group, GroupAdmin)


#from resources.models import Reservation
# from allauth.socialaccount.models import SocialAccount, EmailAddress
#
#

#
#
# first_names_list = [
#     'Patrick',
#     'Julia',
#     'Andrew',
#     'Paige',
#     'Ewan',
#     'Elsie',
#     'Toby',
#     'Holly',
#     'Dominic',
#     'Isla',
#     'Edison',
#     'Luna',
#     'Ronald',
#     'Bryanna',
#     'Augustus',
#     'Laurel',
#     'Miles',
#     'Patricia',
#     'Beckett',
#     'Elle'
# ]
#
# last_names_list = [
#     'Ward',
#     'Robertson',
#     'Nicholson',
#     'Armstrong',
#     'White',
#     'Trevino',
#     'James',
#     'Hines',
#     'Clark',
#     'Castro',
#     'Read',
#     'Brown',
#     'Griffiths',
#     'Taylor',
#     'Cole',
#     'Leach',
#     'Chavez',
#     'Stout',
#     'Mccullough',
#     'Richards'
# ]
#
#
# def _add_general_admin_to_fieldsets(fieldsets):
#     def modify_field_data(field_data):
#         if 'is_superuser' in (field_data or {}).get('fields', ()):
#             fields = list(field_data['fields'])
#             fields.insert(fields.index('is_superuser'), 'is_general_admin')
#             return dict(field_data, fields=tuple(fields))
#         return field_data
#
#     return tuple(
#         (label, modify_field_data(field_data))
#         for (label, field_data) in fieldsets)
#
#
# def anonymize_user_data(modeladmin, request, queryset):
#     for user in queryset:
#         user.first_name = random.choice(first_names_list)
#         user.last_name = random.choice(last_names_list)
#         user.username = f'anonymized-{uuid.uuid4()}'
#         user.email = f'{user.first_name}.{user.last_name}@anonymized.net'.lower()
#         user.uuid = uuid.uuid4()
#         user.save()
#
#         SocialAccount.objects.filter(user=user).update(uid=user.uuid, extra_data='{}')
#         EmailAddress.objects.filter(user=user).update(email=user.email)
#
#         user_reservations = Reservation.objects.filter(user=user)
#         user_reservations.update(
#             state=Reservation.CANCELLED,
#             event_subject='Removed',
#             event_description='Sensitive data of this reservation has been anonymized by a script.',
#             host_name='Removed',
#             reservation_extra_questions='Removed',
#             reserver_name='Removed',
#             reserver_id='Removed',
#             reserver_email_address='Removed',
#             reserver_phone_number='Removed',
#             reserver_address_street='Removed',
#             reserver_address_zip='Removed',
#             reserver_address_city='Removed',
#             company='Removed',
#             billing_first_name='Removed',
#             billing_last_name='Removed',
#             billing_email_address='Removed',
#             billing_phone_number='Removed',
#             billing_address_street='Removed',
#             billing_address_zip='Removed',
#             billing_address_city='Removed',
#             participants='Removed'
#         )
#     anonymize_user_data.short_description = 'Anonymize user\'s personal information'
#
#
# class UserAdmin(DjangoUserAdmin):
#     fieldsets = _add_general_admin_to_fieldsets(DjangoUserAdmin.fieldsets) + (
#         (None, {'fields': ('department_name', 'uuid', 'favorite_resources')}),
#     )
#     list_display = [
#         'uuid', 'username', 'email',
#         'first_name', 'last_name',
#         'is_staff', 'is_general_admin', 'is_superuser'
#     ]
#     list_filter = [
#         'is_staff', 'is_general_admin', 'is_superuser',
#         'is_active',
#         'groups',
#     ]
#     actions = [anonymize_user_data]
