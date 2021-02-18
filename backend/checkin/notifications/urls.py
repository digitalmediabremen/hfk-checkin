from django.urls import path, include

from .views import PreviewView, TemplatePreviewView

urlpatterns = [
    #path('preview/', PreviewView.as_view(), name='email-preview'),
    path('preview/', TemplatePreviewView.as_view(), name='email-preview'),
]
