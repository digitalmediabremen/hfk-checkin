# -*- coding: utf-8 -*-
from decimal import Decimal
import pytest
import datetime
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
from django.utils.translation import activate
from PIL import Image

#from checkin.resources.enums import UnitAuthorizationLevel, UnitGroupAuthorizationLevel
#from checkin.resources.errors import InvalidImage
from checkin.resources.models import Resource, ResourceCapacityPolicy
from checkin.resources.tests.utils import get_field_errors # create_resource_image, get_test_image_data,


@pytest.mark.django_db
@pytest.fixture
def resource_with_default_capacity_10(space_resource_type, test_unit):
    return Resource.objects.create(
        type=space_resource_type,
        name="resource in unit",
        unit=test_unit,
        reservable=True,
        people_capacity_default=10
    )


@pytest.mark.django_db
@pytest.fixture
def resource_with_default_capacity_10_min(space_resource_type, test_unit):
    return Resource.objects.create(
        type=space_resource_type,
        name="resource in unit",
        unit=test_unit,
        reservable=True,
        people_capacity_default=10,
        people_capacity_calculation_type=Resource.CAPACITY_CALCULATION_MIN
    )


@pytest.mark.django_db
@pytest.fixture
def resource_with_default_capacity_10_max(space_resource_type, test_unit):
    return Resource.objects.create(
        type=space_resource_type,
        name="resource in unit",
        unit=test_unit,
        reservable=True,
        people_capacity_default=10,
        people_capacity_calculation_type=Resource.CAPACITY_CALCULATION_MAX
    )

@pytest.mark.django_db
@pytest.fixture
def resource_with_default_capacity_10_none(space_resource_type, test_unit):
    return Resource.objects.create(
        type=space_resource_type,
        name="resource in unit",
        unit=test_unit,
        reservable=True,
        people_capacity_default=10,
        people_capacity_calculation_type = Resource.CAPACITY_CALCULATION_NONE
    )


@pytest.mark.django_db
@pytest.fixture
def resource_without_default_capacity(space_resource_type, test_unit):
    return Resource.objects.create(
        type=space_resource_type,
        name="resource in unit",
        unit=test_unit,
        reservable=True,
        people_capacity_default=None
    )


@pytest.mark.django_db
@pytest.fixture
def resource_without_default_capacity_none(space_resource_type, test_unit):
    return Resource.objects.create(
        type=space_resource_type,
        name="resource in unit",
        unit=test_unit,
        reservable=True,
        people_capacity_default=None,
        people_capacity_calculation_type=Resource.CAPACITY_CALCULATION_NONE
    )


@pytest.mark.django_db
@pytest.fixture
def resourcecapacitypolicy_abs_1():
    policy = ResourceCapacityPolicy.objects.create(
        name = 'test policy',
        value = 1
    )
    return policy


@pytest.mark.django_db
@pytest.fixture
def resourcecapacitypolicy_abs_2():
    policy = ResourceCapacityPolicy.objects.create(
        name = 'test policy',
        value = 2
    )
    return policy

@pytest.mark.django_db
@pytest.fixture
def resourcecapacitypolicy_abs_99():
    policy = ResourceCapacityPolicy.objects.create(
        name = 'test policy',
        value = 99
    )
    return policy


@pytest.mark.django_db
@pytest.fixture
def resourcecapacitypolicy_abs_99():
    policy = ResourceCapacityPolicy.objects.create(
        name = 'test policy',
        value = 99
    )
    return policy


@pytest.mark.django_db
def test_resource_people_capacity_without_policy(resource_without_default_capacity, resource_with_default_capacity_10):
    r = Resource.objects.get(pk=resource_without_default_capacity.pk)
    assert r.people_capacity is None

    r = Resource.objects.get(pk=resource_with_default_capacity_10.pk)
    assert r.people_capacity is 10


@pytest.mark.django_db
def test_resource_people_capacity_policy_abs_1(resourcecapacitypolicy_abs_1, resource_without_default_capacity, resource_with_default_capacity_10):
    resourcecapacitypolicy_abs_1.resources.add(resource_without_default_capacity)
    resourcecapacitypolicy_abs_1.resources.add(resource_with_default_capacity_10)

    r = Resource.objects.get(pk=resource_without_default_capacity.pk)
    assert r.people_capacity is 1

    r = Resource.objects.get(pk=resource_with_default_capacity_10.pk)
    assert r.people_capacity is 1


@pytest.mark.django_db
def test_resource_people_capacity_policy_abs_1_and_abs_2(resourcecapacitypolicy_abs_1, resourcecapacitypolicy_abs_2, resource_with_default_capacity_10_none, resource_with_default_capacity_10_max, resource_with_default_capacity_10_min, resource_without_default_capacity_none):
    resourcecapacitypolicy_abs_1.resources.add(resource_with_default_capacity_10_none)
    resourcecapacitypolicy_abs_1.resources.add(resource_with_default_capacity_10_min)
    resourcecapacitypolicy_abs_1.resources.add(resource_with_default_capacity_10_max)
    resourcecapacitypolicy_abs_1.resources.add(resource_without_default_capacity_none)
    resourcecapacitypolicy_abs_2.resources.add(resource_with_default_capacity_10_none)
    resourcecapacitypolicy_abs_2.resources.add(resource_with_default_capacity_10_min)
    resourcecapacitypolicy_abs_2.resources.add(resource_with_default_capacity_10_max)
    resourcecapacitypolicy_abs_2.resources.add(resource_without_default_capacity_none)

    r = Resource.objects.get(pk=resource_with_default_capacity_10_none.pk)
    assert r.people_capacity is 10

    r = Resource.objects.get(pk=resource_with_default_capacity_10_min.pk)
    assert r.people_capacity is 1

    r = Resource.objects.get(pk=resource_with_default_capacity_10_max.pk)
    assert r.people_capacity is 2

    r = Resource.objects.get(pk=resource_without_default_capacity_none.pk)
    assert r.people_capacity is None


@pytest.mark.django_db
def test_resource_people_capacity_policy_abs_99(resourcecapacitypolicy_abs_99, resource_without_default_capacity, resource_with_default_capacity_10):
    resourcecapacitypolicy_abs_99.resources.add(resource_without_default_capacity)
    resourcecapacitypolicy_abs_99.resources.add(resource_with_default_capacity_10)

    r = Resource.objects.get(pk=resource_without_default_capacity.pk)
    assert r.people_capacity is 99
    # FIXME does this make any sense? setting a resource without capacity to a random policy cap?

    r = Resource.objects.get(pk=resource_with_default_capacity_10.pk)
    assert r.people_capacity is 10


# @pytest.mark.django_db
# def test_only_one_main_image(space_resource):
#     i1 = create_resource_image(space_resource, type="main")
#     assert i1.type == "main"
#     i2 = create_resource_image(space_resource, type="main")
#
#     assert i2.type == "main"
#     # The first image should have been turned non-main after the new main image was created
#     assert ResourceImage.objects.get(pk=i1.pk).type == "other"
#
#     i3 = create_resource_image(space_resource, type="other")
#     assert i3.type == "other"
#     # But adding a new non-main image should not have dethroned i2 from being main
#     assert ResourceImage.objects.get(pk=i2.pk).type == "main"
#
#
# @pytest.mark.django_db
# @pytest.mark.parametrize("format", ("BMP", "PCX"))
# @pytest.mark.parametrize("image_type", ("main", "map", "ground_plan"))
# def test_image_transcoding(space_resource, format, image_type):
#     """
#     Test that images get transcoded into JPEG or PNG if they're not JPEG/PNG
#     """
#     data = get_test_image_data(format=format)
#     ri = ResourceImage(
#         resource=space_resource,
#         sort_order=8,
#         type=image_type,
#         image=ContentFile(data, name="long_horse.%s" % format)
#     )
#     expected_format = ("PNG" if image_type in ("map", "ground_plan") else "JPEG")
#     ri.full_clean()
#     assert ri.image_format == expected_format  # Transcoding occurred
#     assert Image.open(ri.image).format == expected_format  # .. it really did!
#
#
# @pytest.mark.django_db
# @pytest.mark.parametrize("format", ("JPEG", "PNG"))
# def test_image_transcoding_bypass(space_resource, format):
#     """
#     Test that JPEGs and PNGs bypass transcoding
#     """
#     data = get_test_image_data(format=format)
#     ri = ResourceImage(
#         resource=space_resource,
#         sort_order=8,
#         type="main",
#         image=ContentFile(data, name="nice.%s" % format)
#     )
#     ri.full_clean()
#     assert ri.image_format == format  # Transcoding did not occur
#     assert Image.open(ri.image).format == format  # no, no transcoding
#     ri.image.seek(0)  # PIL may have `seek`ed or read the stream
#     assert ri.image.read() == data  # the bitstream is identical
#
#
# @pytest.mark.django_db
# def test_invalid_image(space_resource):
#     data = b"this is text, not an image!"
#     ri = ResourceImage(
#         resource=space_resource,
#         sort_order=8,
#         type="main",
#         image=ContentFile(data, name="bogus.xyz")
#     )
#     with pytest.raises(InvalidImage) as ei:
#         ri.full_clean()
#     assert "cannot identify" in ei.value.message


# @pytest.mark.django_db
# def test_price_validations(resource_in_unit):
#     activate('en')
#
#     resource_in_unit.min_price = Decimal(1)
#     resource_in_unit.max_price = None
#     resource_in_unit.full_clean()  # should not raise
#
#     resource_in_unit.min_price = Decimal(8)
#     resource_in_unit.max_price = Decimal(5)
#     with pytest.raises(ValidationError) as ei:
#         resource_in_unit.full_clean()
#     assert 'This value cannot be greater than max price' in get_field_errors(ei.value, 'min_price')
#
#     resource_in_unit.min_price = Decimal(-5)
#     resource_in_unit.max_price = Decimal(-8)
#     with pytest.raises(ValidationError) as ei:
#         resource_in_unit.full_clean()
#     assert 'Ensure this value is greater than or equal to 0.00.' in get_field_errors(ei.value, 'min_price')
#     assert 'Ensure this value is greater than or equal to 0.00.' in get_field_errors(ei.value, 'max_price')
#
#
# @pytest.mark.django_db
# def test_time_slot_validations(resource_in_unit):
#     activate('en')
#
#     resource_in_unit.min_period = datetime.timedelta(hours=2)
#     resource_in_unit.slot_size = datetime.timedelta(minutes=45)
#     with pytest.raises(ValidationError) as error:
#         resource_in_unit.full_clean()
#     assert 'This value must be a multiple of slot_size' in get_field_errors(error.value, 'min_period')
#
#     resource_in_unit.min_period = datetime.timedelta(hours=2)
#     resource_in_unit.slot_size = datetime.timedelta(minutes=30)
#     resource_in_unit.full_clean()
#
#
# @pytest.mark.django_db
# def test_queryset_with_perm(resource_in_unit, user):
#     resources = Resource.objects.with_perm('can_view_reservation_catering_orders', user)
#     assert not resources
#
#     # user.unit_authorizations.create(
#     #     authorized=user,
#     #     level=UnitAuthorizationLevel.manager,
#     #     subject=resource_in_unit.unit
#     # )
#     # user.save()
#
#     resources = Resource.objects.with_perm('can_view_reservation_catering_orders', user)
#     assert resources
#     assert resource_in_unit in resources
#
#     # user.unit_authorizations.create(
#     #     authorized=user,
#     #     level=UnitAuthorizationLevel.admin,
#     #     subject=resource_in_unit.unit
#     # )
#
#     resources = Resource.objects.with_perm('can_modify_paid_reservations', user)
#     assert not resources
#
#     user.unit_authorizations.all().delete()
#
#     # user.unit_authorizations.create(
#     #     authorized=user,
#     #     level=UnitAuthorizationLevel.viewer,
#     #     subject=resource_in_unit.unit
#     # )
#
#     resources = Resource.objects.with_perm('can_modify_reservations', user)
#     assert resources
#     assert resource_in_unit in resources


