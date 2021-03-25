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


class AdminUserLookupPermissionMixin():
    # ("can_view_external_users", _("Can view external Users")),
    # ("can_view_regular_users", _("Can view regular Users")),
    # ("can_view_unverified_users", _("Can view unverified Users")),
    # ("can_view_any_user", _("Can view unverified Users")),
    # ("can_view_real_names", _("Can view full names")),
    # ("can_view_full_email", _("Can view full e-mail addresses")),
    # ("can_view_full_phone_number", _("Can view full phone numbers")),

    def get_queryset(self, request, allow_any=False):
        qs = super().get_queryset(request).exclude_anonymous_users()
        # TODO qs limits are not working in AdminView, are they?
        # TODO see fixme on UserAdmin
        # if allow_any or request.user.is_superuser or request.user.has_perm('users.can_view_any_user'):
        #     return qs
        # if not request.user.has_perm('users.can_view_external_users'):
        #     qs = qs.exclude(profile__is_external=True)
        # if not request.user.has_perm('users.can_view_regular_users'):
        #     qs = qs.exclude(profile__is_external=False)
        # if not request.user.has_perm('users.can_view_unverified_users'):
        #     qs = qs.exclude(profile__verified=True)
        return qs


class UserAdmin(AdminUserLookupPermissionMixin, UserAdminImpersonateMixin, DjangoUserAdmin):
    open_new_window = True
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Additional info'), {'fields': ('preferred_language', )}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
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
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    add_form = UserCreationForm
    inlines = [UserProfileAdminInline]

    # All staff users need view permission on Users to successfully use autocomplete fields.
    # Still UserAdmin shall be hidden from admin list for regular (non admin / manager) users.
    def has_view_permission(self, request, obj=None):
        return request.user.is_staff or super().has_view_permission(request, obj)

    # protect user data by not allowing viewing changelist / changeform without explicit permission
    def has_view_or_change_permission(self, request, obj=None):
        return super().has_view_permission(request, obj) or self.has_change_permission(request, obj)

    # FIXME get_search_results is apparently also used on Admin's changelist view, not only on automplete.
    # FIXME therefore it is still all or nothing, which will not help if we want to hide / protect user data against lookups.
    # def get_queryset(self, request, allow_any=False):
    #     if allow_any: #or request.user.is_superuser: #or request.user.has_perm('users.can_view_any_user'):
    #         return User.objects.all()
    #     else:
    #         return User.objects.none()
    #
    # def get_search_results(self, request, queryset, search_term):
    #     queryset = self.get_queryset(request, allow_any=True)
    #     queryset, use_distinct = super().get_search_results(request, queryset, search_term)
    #     queryset = queryset.exclude(profile__is_external=True)
    #     return queryset, use_distinct


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

if not admin.site.is_registered(User):
    admin.site.register(User, UserAdmin)

@admin.register(Profile)
class ProfileAdmin(SimpleHistoryAdmin, admin.ModelAdmin):
    # TODO: default query set nur nicht Verifiziert
    # TODO: default query set nur neue Nutzer

    list_display = ('id','first_name', 'last_name','phone_obfuscated','email_obfuscated','verified','is_external','user','created_at')
    # ! overwritten by get_list_display to upgrade permission
    # readonly_fields = ('last_checkin',)
    list_editable = ('verified',)
    list_filter = ('updated_at','created_at','verified','is_external')
    search_fields = ['first_name', 'last_name','phone','email']
    readonly_fields = ('created_at', 'updated_at','user')

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser and 'user' in self.readonly_fields:
            rof = list(self.readonly_fields)
            rof.remove('user')
            return rof
        return self.readonly_fields

    def get_list_display(self, request):
        phone = 'phone' if request.user.has_perm('tracking.can_view_full_phone_number') else 'phone_obfuscated'
        email = 'email' if request.user.has_perm('tracking.can_view_full_email') else 'email_obfuscated'
        list_display = ['id', 'first_name', 'last_name', phone, email, 'verified', 'is_external', 'created_at']
        return list_display

    # TODO hide email in change view or make sure people understand change view will display all fields.

    def phone_obfuscated(self, object):
        if object.phone:
            m = object.phone
            return f'{m[0]}{m[1]}{m[2]}{m[3]}{m[4]}{"*" * (len(m) - 6)}{m[-1]}'
    phone_obfuscated.short_description = _("Telefonnummer")

    def email_obfuscated(self, object):
        if object.email:
            m = object.email.split('@')
            return f'{m[0][0]}{m[0][1]}{"*" * (len(m[0]) - 4)}{m[0][-2]}{m[0][-1]}@{m[1]}'
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