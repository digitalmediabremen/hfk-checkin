class CommonExcludeMixin(object):
    readonly_fields = ('id',)
    exclude = ('created_at', 'created_by', 'modified_at', 'modified_by')


class PopulateCreatedAndModifiedMixin(object):
    def save_model(self, request, obj, form, change):
        if change is False:
            obj.created_by = request.user
        obj.modified_by = request.user
        #obj.save()
        super().save_model(request, obj, form, change)


class ExtraReadonlyFieldsOnUpdateMixin(object):
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        field_names = getattr(self, 'extra_readonly_fields_on_update', [])

        if obj:
            readonly_fields.extend(field_names)

        return tuple(readonly_fields)

class ModifiableModelAdminMixin():
    _fields = ('modified_at', 'modified_by', 'created_at', 'created_by')
    """
    Mixin for ModelAdmins on models inheriting for "ModifiableModel".
    """
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        readonly_fields += self._fields

        return tuple(readonly_fields)
