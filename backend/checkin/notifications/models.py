import logging

from django.conf import settings
from django.db import models
from django.utils import translation
from django.utils.html import strip_tags
from django.utils.translation import gettext_lazy as _
from django.utils.formats import date_format
# from jinja2 import StrictUndefined
# from jinja2.exceptions import TemplateError
# from jinja2.sandbox import SandboxedEnvironment
# from parler.models import TranslatableModel, TranslatedFields
# from parler.utils.context import switch_language
#
DEFAULT_LANG = settings.LANGUAGES[0][0]
#
logger = logging.getLogger(__name__)
#
#

#
#
# class NotificationTemplateException(Exception):
#     pass
#
#
# class NotificationTemplate(TranslatableModel):
#     NOTIFICATION_TYPE_CHOICES = (
#         (NotificationType.RESERVATION_REQUESTED, _('Reservation requested')),
#         (NotificationType.RESERVATION_REQUESTED_OFFICIAL, _('Reservation requested official')),
#         (NotificationType.RESERVATION_CANCELLED, _('Reservation cancelled')),
#         (NotificationType.RESERVATION_CONFIRMED, _('Reservation confirmed')),
#         (NotificationType.RESERVATION_CREATED, _('Reservation created')),
#         (NotificationType.RESERVATION_DENIED, _('Reservation denied')),
#         (NotificationType.RESERVATION_CREATED_WITH_ACCESS_CODE, _('Reservation created with access code')),
#         (NotificationType.RESERVATION_ACCESS_CODE_CREATED, _('Access code was created for a reservation')),
#         (NotificationType.RESERVATION_WAITING_FOR_PAYMENT, _('Reservation waiting for payment')),
#
#         (NotificationType.CATERING_ORDER_CREATED, _('Catering order created')),
#         (NotificationType.CATERING_ORDER_MODIFIED, _('Catering order modified')),
#         (NotificationType.CATERING_ORDER_DELETED, _('Catering order deleted')),
#         (NotificationType.RESERVATION_COMMENT_CREATED, _('Reservation comment created')),
#         (NotificationType.CATERING_ORDER_COMMENT_CREATED, _('Catering order comment created')),
#     )
#
#     type = models.CharField(
#         verbose_name=_('Type'), choices=NOTIFICATION_TYPE_CHOICES, max_length=100, unique=True, db_index=True
#     )
#
#     translations = TranslatedFields(
#         short_message=models.TextField(
#             verbose_name=_('Short message'), blank=True, help_text=_('Short notification text for e.g. SMS messages')
#         ),
#         subject=models.CharField(
#             verbose_name=_('Subject'), max_length=200, help_text=_('Subject for email notifications')
#         ),
#         body=models.TextField(verbose_name=_('Body'), help_text=_('Text body for email notifications'), blank=True),
#         html_body=models.TextField(
#             verbose_name=_('HTML body'), help_text=_('HTML body for email notifications'), blank=True,
#         )
#     )

from post_office.models import EmailTemplate
from .template_field import TemplateField
from django.template.loader import get_template
from .types import NotificationType


class NotificationEmailTemplate(EmailTemplate):
    """ extends django-postoffice's EmailTemplate to include with file based templates and type definitions"""
    """ Similar to respa's NotificationTemplate, different with name and type"""

    type = models.CharField(
        verbose_name=_('Type'), choices=NotificationType.choices, max_length=100, unique=True, db_index=True, blank=True, null=True,
    )
    #template = TemplateField(match='^notifications/.+\.html$', blank=True)

    class Meta:
        #app_label = 'post_office' # do not change. will move migrations into another app. no good!
        #unique_together = ('name', 'language', 'default_template')
        verbose_name = _("Email Template")
        verbose_name_plural = _("Email Templates")
        ordering = ['name']

    def get_template(self):
        if not self.template:
            return None
        return get_template(self.template)

    # def get_html_content(self):
    #     """ overwrite original field EmailTemplate.html_content """
    #     t = self.get_template()
    #     if t is None:
    #         return None
    #     return open(t.origin.name, 'r').read()

    class Meta:
        verbose_name = _('Notification template')
        verbose_name_plural = _('Notification templates')

    def __str__(self):
        for t in NotificationType.choices:
            if t[0] == self.type:
                return str(t[1])
        return 'N/A'

    # def render(self, context, language_code=DEFAULT_LANG):
    #     """
    #     Render this notification template with given context and language
    #
    #     Returns a dict containing all content fields of the template. Example:
    #
    #     {'short_message': 'foo', 'subject': 'bar', 'body': 'baz', 'html_body': '<b>foobar</b>'}
    #
    #     """
    #
    #     # env = SandboxedEnvironment(trim_blocks=True, lstrip_blocks=True, undefined=StrictUndefined)
    #     # env.filters['reservation_time'] = reservation_time
    #     # env.filters['format_datetime'] = format_datetime
    #     # env.filters['format_datetime_tz'] = format_datetime_tz
    #
    #     logger.debug('Rendering template for notification %s' % self.type)
    #     # TODO switch language
    #     #with switch_language(self, language_code):
    #     # try:
    #     rendered_notification = {
    #         'short_message'
    #         'subject':
    #         'html_body':
    #         ''
    #         for attr in ('short_message', 'subject', 'html_body')
    #     }
    #     if self.body:
    #         rendered_notification['body'] = env.from_string(self.body).render(context)
    #     else:
    #         # if text body is empty use html body without tags as text body
    #         rendered_notification['body'] = strip_tags(rendered_notification['html_body'])
    #     return rendered_notification
    #     # except TemplateError as e:
    #     #     raise NotificationTemplateException(e) from e


# def reservation_time(res):
#     if isinstance(res, dict):
#         return res['time_range']
#     return res.format_time()
#
#
# def format_datetime(dt):
#     current_language = translation.get_language()
#     if current_language == 'fi':
#         # ma 1.1.2017 klo 12.00
#         dt_format = r'D j.n.Y \k\l\o G.i'
#     else:
#         # default to English
#         dt_format = r'D j/n/Y G:i'
#
#     return date_format(dt, dt_format)
#
#
# def format_datetime_tz(dt, tz):
#     dt = dt.astimezone(tz)
#     return format_datetime(dt)
#
#
# def render_notification_template(notification_type, context, language_code=DEFAULT_LANG):
#     # try:
#     template = NotificationEmailTemplate.objects.get(type=notification_type)
#     # except NotificationEmailTemplate.DoesNotExist as e:
#     #     raise NotificationTemplateException(e) from e
#
#     return template.render(context, language_code)