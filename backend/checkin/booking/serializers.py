from __future__ import unicode_literals
from .models import *
from rest_framework import serializers
from rest_framework.fields import ReadOnlyField, SerializerMethodField

from checkin.tracking.models import Location
from checkin.tracking.serializers import BaseProfileSerializer
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    access_allowed_to_current_user = serializers.BooleanField(default=True)
    class Meta:
        model = Room
        fields = ['id','display_numbers', 'display_name','numbers', 'name', 'comment','access_restricted','access_allowed_to_current_user']#'max_capacity', 'access_allowed_to_currect_user']
    # number
    # name
    # subtitle # = category
    # alternative_names
    # id
    # description
    # floor_number
    # floor_name
    # segment_number
    # capacity
    # access_restricted
    # access_allowed_to_currect_user
    # access_manager
    # access_rules
    #
    # features
    # bookable
    #
    #
    # capacities = serializers.SerializerMethodField(read_only=True)
    # id = ReadOnlyField()
    #
    # class Meta:
    #     model = Location
    #     fields = ['id', 'code', 'org_number', 'org_name', 'capacity', 'load', 'parent', 'capacities']
    #
    # def get_capacities(self, obj):
    #     qset = CapacityForActivityProfile.objects.filter(location=obj)
    #     return [CapacityForActivityProfileSerializer(m).data for m in qset]

class ProfileSerializer(BaseProfileSerializer):
    pass

class GuestSerializer(BaseProfileSerializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField(allow_blank=True)

class RoomBookingRequestSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    rooms_ids = serializers.PrimaryKeyRelatedField(source='rooms',queryset=Room.objects.bookable().all(),many=True, write_only=True)
    guests = GuestSerializer(many=True)
    organizer = ProfileSerializer(read_only=True)
    # # include current user itself?
    # begin = serializers.DateTimeField()
    # end = serializers.DateTimeField()
    # comment = serializers.CharField(allow_blank=True)
    # title = serializers.CharField(allow_blank=True)
    # is_important = serializers.BooleanField()
    # agreed_to_phone_contact = serializers.BooleanField()
    attendants = ProfileSerializer(many=True, read_only=True) # combined organizer and guests
    #send_confirmation_to_self = serializers.BooleanField(allow_null=True)

    class Meta:
        model = RoomBookingRequest
        fields = ['uuid','rooms','rooms_ids','organizer','guests','attendants','start','end','comment','title','is_important']#'send_confirmation_to_self']

    def create(self, validated_data):

        # remove guests data (nested relationship). it can not be processed automatically.
        guests_data = validated_data.pop('guests')
        print(guests_data)

        ## copied from default implementation

        from rest_framework.utils import model_meta
        import traceback

        ModelClass = self.Meta.model

        # Remove many-to-many relationships from validated_data.
        # They are not valid arguments to the default `.create()` method,
        # as they require that the instance has already been saved.
        info = model_meta.get_field_info(ModelClass)
        many_to_many = {}
        for field_name, relation_info in info.relations.items():
            if relation_info.to_many and (field_name in validated_data):
                many_to_many[field_name] = validated_data.pop(field_name)

        try:
            instance = ModelClass._default_manager.create(**validated_data)
        except TypeError:
            tb = traceback.format_exc()
            msg = (
                    'Got a `TypeError` when calling `%s.%s.create()`. '
                    'This may be because you have a writable field on the '
                    'serializer class that is not a valid argument to '
                    '`%s.%s.create()`. You may need to make the field '
                    'read-only, or override the %s.create() method to handle '
                    'this correctly.\nOriginal exception was:\n %s' %
                    (
                        ModelClass.__name__,
                        ModelClass._default_manager.name,
                        ModelClass.__name__,
                        ModelClass._default_manager.name,
                        self.__class__.__name__,
                        tb
                    )
            )
            raise TypeError(msg)

        # Save many-to-many relationships after the instance is created.
        if many_to_many:
            for field_name, value in many_to_many.items():
                field = getattr(instance, field_name)
                field.set(value)
        ## copy end

        for guest in guests_data:
            p, created = Profile.objects.get_or_create(**guest)
            p.save()
            # FIXME implement on which fields to match on
            instance.guests.add(p)
        # instance.save()
        return instance


#     # extra on model:
#     attendents = List
#
# class RoomBookingRequest(models.Model):
#     rooms = models.ManyToManyField(Room)
#     organizer = models.ForeignKey(Profile)
#     attendants = combine ORGANIZER and GUESTS
#     guests = models.ManyToManyField(Profile)
#     begin = models.DateTimeField()
#     end = models.DateTimeField()
#     comment = models.CharField(allow_blank=True)
#     title = models.CharField(allow_blank=True)
#     is_important = models.BooleanField()
#     agreed_to_phone_contact = models.BooleanField()
#     uuid
#
#
