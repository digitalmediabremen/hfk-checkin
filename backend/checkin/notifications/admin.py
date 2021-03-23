# from parler.admin import TranslatableAdmin
# from parler.forms import TranslatableModelForm
from django.contrib.admin import site as admin_site
from django.utils.translation import gettext_lazy as _
from .models import NotificationEmailTemplate
#
#
# class NotificationTemplateForm(TranslatableModelForm):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         # Do not allow the admin to choose any of the template types that already
#         # exist.
#         qs = NotificationTemplate.objects.values_list('type', flat=True)
#         if self.instance and self.instance.type:
#             qs = qs.exclude(id=self.instance.id)
#         existing_types = set(qs)
#         choices = [x for x in self.fields['type'].choices if x[0] not in existing_types]
#         self.fields['type'].choices = choices
#
#
# class NotificationTemplateAdmin(TranslatableAdmin):
#     #
#     # When attempting to save, validate Jinja templates based on
#     # example data. Possible to get an exception if unknown context
#     # variables are accessed?
#     #
#     form = NotificationTemplateForm
#
#
# admin_site.register(NotificationTemplate, NotificationTemplateAdmin)
from post_office.admin import EmailTemplateAdmin, EmailTemplate, EmailTemplateInline
from .views import TemplatePreviewView
from django.urls import path
from django.conf import settings

class AllLanguagesEmailTemplateInline(EmailTemplateInline):
    min_num = len(settings.LANGUAGES)

class NotificationEmailTemplateAdmin(EmailTemplateAdmin):
    fieldsets = [
        (None, {
            'fields': ('type','name', 'description'),
        }),
        (_("Default Content"), {
            'fields': ('subject', 'content', 'html_content'),
        }),
    ]
    inlines = (AllLanguagesEmailTemplateInline,) if settings.USE_I18N else ()

    class Meta:
        section = 'post_office'

    def get_urls(self):
        urls = super().get_urls()
        extra_urls = [
            path('<path:object_id>/preview/', self.admin_site.admin_view(TemplatePreviewView.as_view()),
                name='notifications_template_preview'),
        ]
        return extra_urls + urls

#unregister original emailtemplate admin
admin_site.unregister(EmailTemplate)
admin_site.register(NotificationEmailTemplate, NotificationEmailTemplateAdmin)