import datetime
import pytest

import arrow
from django.core.exceptions import ValidationError
from django.utils.translation import activate
from django.test import TestCase
from django.test.utils import override_settings
from django.utils import timezone
from freezegun import freeze_time
from django.core import mail
from post_office.mail import (create, get_queued,
                    send, send_many, send_queued, _send_bulk)

#from checkin.resources.enums import UnitAuthorizationLevel
from checkin.resources.models import (
    #Day,
    #Period,
    Reservation, ReservationWarning,
    #ReservationMetadataSet,
    Resource,
    ResourceType,
    Unit,
    #UnitAuthorization,
)

from django.contrib.auth import get_user_model
User = get_user_model()

from guardian.shortcuts import assign_perm


class SetupUnit1WithUnitPermissions():
    fixtures = ['notificationtemplates.json']

    def setUp(self):
        self.unit1 = Unit.objects.create(name='Unit 1', pk='00000000-00000000-00000000-10000001',
                                         time_zone='Europe/Helsinki', slug='U1', public=True)
        self.accessmanager_1 = User.objects.create_user(email='accessmanager-1@example.com')
        self.accessmanager_2 = User.objects.create_user(email='accessmanager-2@example.com')
        assign_perm('resource.unit:can_modify_access', self.accessmanager_1, self.unit1)
        assign_perm('resource.unit:can_modify_access', self.accessmanager_2, self.unit1)
        self.reservationmanager_1 = User.objects.create_user(email='reservationmanager-1@example.com')
        self.reservationmanager_2 = User.objects.create_user(email='reservationmanager-2@example.com')
        assign_perm('resource.unit:can_modify_reservations', self.reservationmanager_1, self.unit1)
        self.usermanager_1 = User.objects.create_user(email='usermanager-1@example.com')
        assign_perm('resource.unit:can_modify_access', self.usermanager_1, self.unit1)


class ReservationTestCase(SetupUnit1WithUnitPermissions,TestCase):

    def tearDown(self):
        pass
        # Unit.objects.delete(pk='00000000-00000000-00000000-10000001')
        # Unit.objects.delete(pk='00000000-00000000-00000000-10000001')
        # Resource.objects.delete(pk='00000000-00000000-00000000-10000001')
        # Resource.objects.delete(pk='00000000-00000000-00000000-10000001')

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(email='test@example.com')
        # self.unit1 = Unit.objects.create(name='Unit 1', pk='00000000-00000000-00000000-10000001', time_zone='Europe/Helsinki', slug='U1')
        self.unit2 = Unit.objects.create(name='Unit 2', pk='00000000-00000000-00000000-10000002', time_zone='Europe/Helsinki', slug='U2')
        self.resourcetype1 = ResourceType.objects.create(name='Type 1', pk='00000000-00000000-00000000-20000001', main_type='space')
        Resource.objects.create(name='Resource 1a', pk='00000000-00000000-00000000-30000001', unit=self.unit1, type=self.resourcetype1)
        Resource.objects.create(name='Resource 1b', pk='00000000-00000000-00000000-30000002', unit=self.unit1, type=self.resourcetype1)
        Resource.objects.create(name='Resource 2a', pk='00000000-00000000-00000000-30000003', unit=self.unit2, type=self.resourcetype1)
        Resource.objects.create(name='Resource 2b', pk='00000000-00000000-00000000-30000004', unit=self.unit2, type=self.resourcetype1)

        # p1 = Period.objects.create(start='2116-06-01', end='2116-09-01', unit=u1, name='')
        # p2 = Period.objects.create(start='2116-06-01', end='2116-09-01', unit=u2, name='')
        # p3 = Period.objects.create(start='2116-06-01', end='2116-09-01', resource_pk='r1a', name='')
        # Day.objects.create(period=p1, weekday=0, opens='08:00', closes='22:00')
        # Day.objects.create(period=p2, weekday=1, opens='08:00', closes='16:00')
        # Day.objects.create(period=p3, weekday=0, opens='08:00', closes='18:00')
        #
        # u1.update_opening_hours()
        # u2.update_opening_hours()

    # def test_opening_hours(self):
    #     r1a = Resource.objects.get(pk='r1a')
    #     r1b = Resource.objects.get(pk='r1b')
    #
    #     date = arrow.get('2116-06-01').date()
    #     end = arrow.get('2116-06-02').date()
    #     days = r1a.get_opening_hours(begin=date, end=end)  # Monday
    #     hours = days[date][0]  # first day object of chosen days
    #     self.assertEqual(hours['opens'].time(), datetime.time(8, 00))
    #     self.assertEqual(hours['closes'].time(), datetime.time(18, 00))
    #
    #     days = r1b.get_opening_hours(begin=date, end=end)  # Monday
    #     hours = days[date][0]  # first day object of chosen days
    #     self.assertEqual(hours['opens'].time(), datetime.time(8, 00))
    #     self.assertEqual(hours['closes'].time(), datetime.time(22, 00))

    def test_simple_reservation(self):
        r1a = Resource.objects.get(pk='00000000-00000000-00000000-30000001')
        r1b = Resource.objects.get(pk='00000000-00000000-00000000-30000002')
        self.do_reservation_on_resource(r1a)

    def test_simple_reservation_on_resource_with_long_name(self):
        resource_with_long_name = Resource.objects.create(name='Stud. Arbeitsraum / Büro Prof. Baumkötter', numbers=['3.16.040'], pk='00000000-00000000-00000000-30000005', unit=self.unit2, type=self.resourcetype1)
        self.do_reservation_on_resource(resource_with_long_name)

    def test_reservation_on_resource_with_capacity_2(self):
        r = Resource.objects.create(name='resource', people_capacity_default=2, unit=self.unit2, type=self.resourcetype1)
        self.do_reservation_on_resource(r)

    def test_reservation_on_resource_with_capacity_0(self):
        r = Resource.objects.create(name='resource', people_capacity_default=0, unit=self.unit2, type=self.resourcetype1)
        self.do_reservation_on_resource(r)

    def test_reservation_on_resource_without_capacity(self):
        r = Resource.objects.create(name='resource', people_capacity_default=None, unit=self.unit2,
                                    type=self.resourcetype1)
        self.do_reservation_on_resource(r)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_reservation_with_multiple_access_managers(self):
        print("test_reservation_with_multiple_access_managers")
        NUM_OF_TOTAL_MAILS_TO_SEND = 3
        r = Resource.objects.create(name='resource', people_capacity_default=None, unit=self.unit2,
                                    type=self.resourcetype1, need_manual_confirmation=True, reservable=True)
        assign_perm('resource.resource:can_modify_reservations', self.reservationmanager_1, r)
        assign_perm('resource.resource:can_modify_reservations', self.reservationmanager_2, r)

        self.do_reservation_on_resource(r)
        queue = get_queued()
        self.assertEqual(len(queue), NUM_OF_TOTAL_MAILS_TO_SEND)
        # self.assertEqual(queue[0].to, self.user.get_email_notation())
        # self.assertEqual(queue[1].to, self.reservationmanager_1.get_email_notation())
        # self.assertEqual(queue[2].to, self.reservationmanager_2.get_email_notation())
        send_queued()


    def do_reservation_on_resource(self, resource):
        tz = timezone.get_current_timezone()
        begin = tz.localize(datetime.datetime(2116, 6, 1, 8, 0, 0))
        end = begin + datetime.timedelta(hours=2)

        reservation = Reservation.objects.create(resource=resource, begin=begin, end=end, user=self.user)
        reservation.clean()
        reservation.process_state_change(Reservation.CREATED, Reservation.REQUESTED, self.user)
        #reservation.save()
        return reservation

    # def test_reservation_warnings(self):

        # TODO assert warnings triggered with warnings.warn()

        # Attempt overlapping reservation
        # with self.assertWarns(ReservationWarning):
        #     reservation = Reservation(resource=resource, begin=begin, end=end)
        #     reservation.clean()
        #
        # valid_begin = begin + datetime.timedelta(hours=3)
        # valid_end = end + datetime.timedelta(hours=3)
        #
        # # Attempt incorrectly aligned begin time
        # with self.assertWarns(ReservationWarning):
        #     reservation = Reservation(resource=resource, begin=valid_begin + datetime.timedelta(minutes=1), end=valid_end)
        #     reservation.clean()
        #
        # # Attempt incorrectly aligned end time
        # with self.assertWarns(ReservationWarning):
        #     reservation = Reservation(resource=resource, begin=valid_begin, end=valid_end + datetime.timedelta(minutes=1))
        #     reservation.clean()
        #
        # # Attempt reservation that starts before the resource opens
        # # Should not raise an exception as this check isn't included in model clean
        # reservation = Reservation(
        #     resource=resource,
        #     begin=begin - datetime.timedelta(hours=1),
        #     end=begin
        # )
        # reservation.clean()
        #
        # begin = tz.localize(datetime.datetime(2116, 6, 1, 16, 0, 0))
        # end = begin + datetime.timedelta(hours=2)
        #
        # # Make a reservation that ends when the resource closes
        # reservation = Reservation(resource=resource, begin=begin, end=end)
        # reservation.clean()
        #
        # # Attempt reservation that ends after the resource closes
        # # Should not raise an exception as this check isn't included in model clean
        # reservation = Reservation(resource=resource, begin=begin, end=end + datetime.timedelta(hours=1))
        # reservation.clean()


# @pytest.mark.django_db
# def test_need_manual_confirmation_metadata_set(resource_in_unit):
#     data_set = ReservationMetadataSet.objects.get(name='default')
#     assert data_set.supported_fields.exists()
#     assert data_set.required_fields.exists()


# @freeze_time('2115-04-02')
# @pytest.mark.django_db
# def test_valid_reservation_duration_with_slot_size(resource_with_opening_hours):
#     resource_with_opening_hours.min_period = datetime.timedelta(hours=1)
#     resource_with_opening_hours.slot_size = datetime.timedelta(minutes=30)
#     resource_with_opening_hours.save()
#
#     tz = timezone.get_current_timezone()
#     begin = tz.localize(datetime.datetime(2115, 6, 1, 8, 0, 0))
#     end = begin + datetime.timedelta(hours=2, minutes=30)
#
#     reservation = Reservation(resource=resource_with_opening_hours, begin=begin, end=end)
#     reservation.clean()
#
#
# @freeze_time('2115-04-02')
# @pytest.mark.django_db
# def test_invalid_reservation_duration_with_slot_size(resource_with_opening_hours):
#     activate('en')
#
#     resource_with_opening_hours.min_period = datetime.timedelta(hours=1)
#     resource_with_opening_hours.slot_size = datetime.timedelta(minutes=30)
#     resource_with_opening_hours.save()
#
#     tz = timezone.get_current_timezone()
#     begin = tz.localize(datetime.datetime(2115, 6, 1, 8, 0, 0))
#     end = begin + datetime.timedelta(hours=2, minutes=45)
#
#     reservation = Reservation(resource=resource_with_opening_hours, begin=begin, end=end)
#
#     with pytest.raises(ValidationError) as error:
#         reservation.clean()
#     assert error.value.code == 'invalid_time_slot'
#
#
# @freeze_time('2115-04-02')
# @pytest.mark.django_db
# def test_admin_may_bypass_min_period(resource_with_opening_hours, user):
#     """
#     Admin users should be able to bypass min_period,
#     and their minimum reservation time should be limited by slot_size
#     """
#     activate('en')
#
#     # min_period is bypassed respecting slot_size restriction
#     resource_with_opening_hours.min_period = datetime.timedelta(hours=1)
#     resource_with_opening_hours.slot_size = datetime.timedelta(minutes=30)
#     resource_with_opening_hours.save()
#
#     tz = timezone.get_current_timezone()
#     begin = tz.localize(datetime.datetime(2115, 6, 1, 8, 0, 0))
#     end = begin + datetime.timedelta(hours=0, minutes=30)
#
#     # UnitAuthorization.objects.create(
#     #     subject=resource_with_opening_hours.unit,
#     #     level=UnitAuthorizationLevel.admin,
#     #     authorized=user,
#     # )
#
#     reservation = Reservation(resource=resource_with_opening_hours, begin=begin, end=end, user=user)
#     reservation.clean()
#
#     # min_period is bypassed and slot_size restriction is violated
#     resource_with_opening_hours.slot_size = datetime.timedelta(minutes=25)
#     resource_with_opening_hours.save()
#
#     with pytest.raises(ValidationError) as error:
#         reservation.clean()
#     assert error.value.code == 'invalid_time_slot'
