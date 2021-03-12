from django.urls import path, include

from .views import TemplatePreviewView

app_name = "notifications"

urlpatterns = [
    path('preview/', TemplatePreviewView.as_view(), name='email-preview'),
]
