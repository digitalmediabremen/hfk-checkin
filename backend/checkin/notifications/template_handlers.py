# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from django.template.loaders import app_directories, filesystem, cached
from pathlib import Path
try:
    from os import scandir
except ImportError:  # pragma: no cover
    try:
        from scandir import scandir
    except ImportError as e:
        import sys
        from django.utils import six
        message = ("You're probably using Python 2.x, so you'll need to "
                   "install the backport: `pip install scandir\>=1.5`")
        flattened = " ".join(e.args) + "\n" + message
        e.args = (flattened,)
        e.message = flattened
        six.reraise(*sys.exc_info())


__all__ = ['get_results_from_registry']

usable_loaders = {}

def from_filesystem(instance):
    ''' updated to work with pathlib's Path and relative_to().'''
    dirs = instance.get_dirs()
    for dir in dirs:
        directory = Path(dir)
        for i in directory.glob('**/*'):
            if i.is_file():
                yield str(i.relative_to(directory))

def from_cached(instance):
    """
    Just go and look at the registry again using the child loaders...
    """
    loaders = instance.loaders
    for result in get_results_from_registry(loaders):
        yield result

usable_loaders[app_directories.Loader] = from_filesystem
usable_loaders[filesystem.Loader] = from_filesystem
usable_loaders[cached.Loader] = from_cached


def get_results_from_registry(loaders):
    for loader in loaders:
        cls = loader.__class__
        if cls in usable_loaders:
            finder = usable_loaders[cls]
            for result in finder(instance=loader):
                yield result