# use absolute imports in __init__.py
# otherwise tests will not work

from .base import all_views
from checkin.users.api import all_views as users_views
from checkin.resources.api.resource import ResourceListViewSet, ResourceViewSet#, PurposeViewSet
from checkin.resources.api.reservation import ReservationListViewSet
from checkin.resources.api.unit import UnitViewSet
from checkin.resources.api.search import TypeaheadViewSet
from checkin.resources.api.calendar import ReservationCalendarViewSet, ResourceCalendarViewSet
#from checkin.resources.api.equipment import EquipmentViewSet

from rest_framework import routers


class RespaAPIRouter(routers.DefaultRouter):

    def __init__(self):
        super(RespaAPIRouter, self).__init__()
        self.registered_api_views = set()
        self._register_all_views()
        #self.register("search", TypeaheadViewSet, basename="search")

    def _register_view(self, view):
        if view['class'] in self.registered_api_views:
            return
        self.registered_api_views.add(view['class'])
        self.register(view['name'], view['class'], basename=view.get("base_name"))

    def _register_all_views(self):
        for view in all_views:
            self._register_view(view)
        for view in users_views:
            self._register_view(view)
