from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from .models import Location, Checkin, Profile

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name','verified','last_checkin')
    readonly_fields = ('last_checkin',)


class LocationAdmin(MPTTModelAdmin):
    readonly_fields = ('code',)
    list_display = ('org_name', 'org_number', 'capacity', 'code')


class CheckinAdmin(admin.ModelAdmin):
    """Disables all editing capabilities."""
    change_form_template = "admin/view.html"

    # def __init__(self, *args, **kwargs):
    #     super(CheckinAdmin, self).__init__(*args, **kwargs)
    #     self.readonly_fields = self.model._meta.get_all_field_names()

    def get_actions(self, request):
        actions = super(CheckinAdmin, self).get_actions(request)
        del_action = "delete_selected"
        if del_action in actions:
            del actions[del_action]
        return actions

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def save_model(self, request, obj, form, change):
        pass

    def delete_model(self, request, obj):
        pass

    def save_related(self, request, form, formsets, change):
        pass

    def get_actions(self, request):
        actions = super(CheckinAdmin, self).get_actions(request)
        del_action = "delete_selected"
        if del_action in actions:
            del actions[del_action]
        return actions

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def save_model(self, request, obj, form, change):
        pass

    def delete_model(self, request, obj):
        pass

    def save_related(self, request, form, formsets, change):
        pass

admin.site.register(Location,LocationAdmin)
admin.site.register(Checkin,CheckinAdmin)
admin.site.register(Profile,ProfileAdmin)