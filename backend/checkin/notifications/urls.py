from django.urls import path, include

from .views import PreviewView

urlpatterns = [
    path('preview/', PreviewView.as_view(), name='email-preview'),
]
