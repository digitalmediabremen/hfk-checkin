# hfk-checkin backend

## Requirements
* Postgres database (the application is using [postgres specific](https://docs.djangoproject.com/en/3.1/ref/contrib/postgres/) fields / extensions)
* pipenv / virtualenv
* installed requirements 

## Local installation

### Setup database
Make a new database in **Postgres** and configure the settings accordingly in `checkin/stettigns/local.py`
```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'SERVER': 'localhost',
        'NAME': 'hfk-checkin',
    }
}
```
### Start pipenv and install required packages
```
cd backend
pipenv shell
pipenv install
```

### Set the right settings
```
export DJANGO_SETTINGS_MODULE=checkin.settings.local
```

### Set right SITE_DOMAIN
This is custom variable to set the domain in Django's [sites framework](https://docs.djangoproject.com/en/3.1/ref/contrib/sites/))

_Notice: without this setting the external authentification will not work corrently, since the response url will be wrong._

```
export SITE_DOMAIN=localhost:8000
```

### Run migrations
```
python manage.py migrate
```

### Start application
```
python manage.py runserver
```

## Management commands
### checkin.tracking
Anonymize checkin records older then CHECKIN_RETENTION_TIME:
```
python manage.py cleanup_checkins
```
Print (preliminary) report of personal contacts tracked with the application:
```
python manage.py contact_report
```
Print (preliminary) report of usage report:
```
python manage.py usage_report
```