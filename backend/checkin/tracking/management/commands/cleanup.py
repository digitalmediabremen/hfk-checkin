# TODO: command to remove old (3 weeks old) checkins for data protection
from datetime import timedelta

CHECKIN_RETENTION_TIME = timedelta(weeks=3)

