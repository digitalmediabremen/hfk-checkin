import random
import uuid
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib import admin
from django.utils.translation import gettext, gettext_lazy as _
from impersonate.admin import UserAdminImpersonateMixin
from simple_history.admin import SimpleHistoryAdmin

# from checkin.tracking.admin import ProfileAdmin
# from .models import Profile
#
# TODO actually move the profiles model to this app
# admin.site.register(Profile,ProfileAdmin)

class UserAdmin(UserAdminImpersonateMixin, DjangoUserAdmin):
    open_new_window = True
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

#from resources.models import Reservation
# from allauth.socialaccount.models import SocialAccount, EmailAddress
#
#
User = get_user_model()
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

from .models import Profile

@admin.register(Profile)
class ProfileAdmin(SimpleHistoryAdmin):
    # TODO: default query set nur nicht Verifiziert
    # TODO: default query set nur neue Nutzer

    list_display = ('id','first_name', 'last_name','phone_obfuscated','email_obfuscated','verified','user','created_at')
    # ! overwritten by get_list_display to upgrade permission
    # readonly_fields = ('last_checkin',)
    list_editable = ('verified',)
    list_filter = ('updated_at','created_at','verified')
    search_fields = ['first_name', 'last_name','phone','email']
    readonly_fields = ('created_at', 'updated_at','user')

    def get_list_display(self, request):
        phone = 'phone' if request.user.has_perm('tracking.can_view_full_phone_number') else 'phone_obfuscated'
        email = 'email' if request.user.has_perm('tracking.can_view_full_email') else 'email_obfuscated'
        list_display = ['id', 'first_name', 'last_name', phone, email, 'verified', 'created_at']
        return list_display

    # TODO hide email in change view or make sure people understand change view will display all fields.

    def get_queryset(self, request):
        qs = super(ProfileAdmin, self).get_queryset(request)
        if request.user.has_perm('tracking.can_view_all_users'):
            return qs
        return qs.exclude(verified=True)

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