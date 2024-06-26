from __future__ import unicode_literals, absolute_import
from operator import itemgetter
from django.conf import settings
from django.contrib import admin
from django.contrib.staticfiles import finders
#from django.utils import six
from django.utils.deconstruct import deconstructible
from django.utils.module_loading import import_string
from django.utils.text import capfirst
from django.core.checks import Warning
import re
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.core.validators import MaxLengthValidator
from django.db.models import CharField
from django.forms import TypedChoiceField, ChoiceField
from django.forms.widgets import Select
from django.template import TemplateDoesNotExist, engines
from django.template.loader import get_template
from django.utils.encoding import force_text
from functools import partial
from django.utils.translation import gettext_lazy as _
from .template_handlers import get_results_from_registry

def get_templates_from_loaders():
    for engine in engines.all():
        # I only know how to search the DjangoTemplates yo...
        engine = getattr(engine, 'engine')
        loaders = engine.template_loaders
        for result in get_results_from_registry(loaders):
            yield result


@deconstructible
class TemplateExistsValidator(object):
    __slots__ = ('regex', 'missing_template', 'wrong_pattern', '_constructor_args')
    def __init__(self, regex):
        self.regex = re.compile(regex)
        self.missing_template = _('%(value)s is not a valid template')
        self.wrong_pattern = _("%(value)s doesn't match the available template format")

    def __call__(self, value):
        if not self.regex.match(value):
            raise ValidationError(self.wrong_pattern, params={'value': value})
        try:
            get_template(value)
        except TemplateDoesNotExist:
            raise ValidationError(self.missing_template, params={'value': value})

def nice_display_name(template_path):
    setting = getattr(settings, 'TEMPLATESELECTOR_DISPLAY_NAMES', {})
    if template_path in setting.keys():
        return setting[template_path]
    to_space_re = re.compile(r'[^a-zA-Z0-9\-]+')
    name = template_path.rpartition('/')[-1]
    basename = name.rpartition('.')[0]
    lastpart_spaces = to_space_re.sub(' ', basename)
    return capfirst(_(lastpart_spaces)) + " (%s)" % template_path


class TemplateField(CharField):
    def __init__(self, match='^.*$', display_name=nice_display_name, *args, **kwargs):
        if 'max_length' in kwargs:
            raise ImproperlyConfigured(_("max_length is implicitly set to 191 internally"))
        kwargs['max_length'] = 191 # in case of using mysql+utf8mb4 & indexing
        super(TemplateField, self).__init__(*args, **kwargs)

        if not match.startswith('^'):
            raise ImproperlyConfigured("Missing required ^ at start")
        if not match.endswith('$'):
            raise ImproperlyConfigured("Missing required $ at end")
        self.match = match
        template_exists_validator = TemplateExistsValidator(self.match)
        self.validators.append(template_exists_validator)

        if isinstance(display_name, str) and '.' in display_name:
            display_name = import_string(display_name)
        if not callable(display_name):
            raise ImproperlyConfigured(_("display_name= argument must be a callable which takes a single string"))
        self.display_name = display_name

        def filter_choices():
            match_re = re.compile(match)
            choices = get_templates_from_loaders()
            for choice in filter(match_re.match, choices):
                name = self.display_name(choice)
                yield (choice, name)

        self.choices = list(filter_choices())

    def deconstruct(self):
        name, path, args, kwargs = super(TemplateField, self).deconstruct()
        del kwargs["max_length"]
        kwargs['match'] = self.match
        kwargs['display_name'] = self.display_name
        return name, path, args, kwargs

    def contribute_to_class(self, cls, name, **kwargs):
        super(TemplateField, self).contribute_to_class(cls, name, **kwargs)
        display = partial(self.__get_FIELD_template_display, field=self)
        display.short_description = self.verbose_name
        display.admin_order_field = name
        setattr(cls, 'get_%s_display' % self.name, display)
        template_instance = partial(self.__get_FIELD_template_instance, field=self)
        setattr(cls, 'get_%s_instance' % self.name, template_instance)

    def __get_FIELD_template_display(self, cls, field):
        value = getattr(cls, field.attname)
        return self.display_name(value)

    def __get_FIELD_template_instance(self, cls, field):
        value = getattr(cls, field.attname)
        return get_template(value)