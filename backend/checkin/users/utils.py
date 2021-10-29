# -*- coding: utf-8 -*-
from django.apps import apps
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.management import BaseCommand
from django.db import transaction
from sys import stdout
from django.utils.translation import gettext as _

def get_generic_fields():
    """Return a list of all GenericForeignKeys in all models."""
    generic_fields = []
    for model in apps.get_models():
        for field_name, field in model.__dict__.items():
            if isinstance(field, GenericForeignKey):
                generic_fields.append(field)
    return generic_fields


@transaction.atomic()
def merge_model_instances(primary_object, alias_objects, out_method=stdout.write):
    """
    Merge several model instances into one, the `primary_object`.
    Use this function to merge model objects and migrate all of the related
    fields from the alias objects the primary object.
    """
    generic_fields = get_generic_fields()

    # get related fields
    related_fields = list(filter(
        lambda x: x.is_relation is True,
        primary_object._meta.get_fields()))

    many_to_many_fields = list(filter(
        lambda x: x.many_to_many is True, related_fields))

    related_fields = list(filter(
        lambda x: x.many_to_many is False, related_fields))

    # Loop through all alias objects and migrate their references to the
    # primary object
    deleted_objects = []
    deleted_objects_count = 0
    for alias_object in alias_objects:
        # Migrate all foreign key references from alias object to primary
        # object.
        for many_to_many_field in many_to_many_fields:
            alias_varname = many_to_many_field.name
            related_objects = getattr(alias_object, alias_varname)
            for obj in related_objects.all():
                try:
                    # Handle regular M2M relationships.
                    getattr(alias_object, alias_varname).remove(obj)
                    getattr(primary_object, alias_varname).add(obj)
                except AttributeError:
                    # Handle M2M relationships with a 'through' model.
                    # This does not delete the 'through model.
                    # TODO: Allow the user to delete a duplicate 'through' model.
                    through_model = getattr(alias_object, alias_varname).through
                    kwargs = {
                        many_to_many_field.m2m_reverse_field_name(): obj,
                        many_to_many_field.m2m_field_name(): alias_object,
                    }
                    through_model_instances = through_model.objects.filter(**kwargs)
                    for instance in through_model_instances:
                        # Re-attach the through model to the primary_object
                        setattr(
                            instance,
                            many_to_many_field.m2m_field_name(),
                            primary_object)
                        instance.save()
                        # TODO: Here, try to delete duplicate instances that are
                        # disallowed by a unique_together constraint

        for related_field in related_fields:
            if related_field.one_to_many:
                alias_varname = related_field.get_accessor_name()
                related_objects = getattr(alias_object, alias_varname)
                for obj in related_objects.all():
                    field_name = related_field.field.name
                    setattr(obj, field_name, primary_object)
                    obj.save()
            elif related_field.one_to_one or related_field.many_to_one:
                alias_varname = related_field.name
                if not hasattr(alias_object, alias_varname):
                    # related field is empty. skip it.
                    continue
                related_object = getattr(alias_object, alias_varname)
                primary_related_object = getattr(primary_object, alias_varname)
                if primary_related_object is None:
                    setattr(primary_object, alias_varname, related_object)
                    primary_object.save()
                elif related_field.one_to_one:
                    out_method(_("Deleted '{}' of type {} with id {}\n").format(
                        related_object, type(related_object), related_object.id))
                    related_object.delete()

        for field in generic_fields:
            filter_kwargs = {}
            filter_kwargs[field.fk_field] = alias_object._get_pk_val()
            filter_kwargs[field.ct_field] = field.get_content_type(alias_object)
            related_objects = field.model.objects.filter(**filter_kwargs)
            for generic_related_object in related_objects:
                setattr(generic_related_object, field.name, primary_object)
                generic_related_object.save()

        if alias_object.id:
            deleted_objects += [alias_object]
            out_method(_("Deleted '{}' of type {} with id {}\n").format(
                alias_object, type(alias_object), alias_object.id))
            alias_object.delete()
            deleted_objects_count += 1

    return primary_object, deleted_objects, deleted_objects_count