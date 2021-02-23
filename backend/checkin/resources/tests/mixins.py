import datetime
import string
import random
import jwt
from rest_framework_jwt.settings import api_settings


class JWTMixin(object):
    jwt_token = {
        "username": "testuser",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "department_name": "bestdep",
        "display_name": "Test User",
        "iss": "https://test.example.com/sso",
        "sub": "7af6c103-62aa-47d4-89e2-4bdd45c6ab7b",  # random UUID
        "aud": "TH11btLwVBZyTCVDMshRaWMIqctoNIyy3xQBvKDD",
        "exp": 1446421460
    }

    @staticmethod
    def generate_random_string(length):
        chars = string.ascii_letters + string.digits
        return ''.join(random.choice(chars) for x in range(length))

    def get_auth(self, **extra):
        secret_key = generate_random_string(100)
        api_settings.JWT_SECRET_KEY = secret_key
        audience = generate_random_string(40)
        api_settings.JWT_AUDIENCE = audience

        jwt_token = self.jwt_token.copy()
        if 'aud' in extra:
            jwt_token['aud'] = extra['aud']
        else:
            jwt_token['aud'] = api_settings.JWT_AUDIENCE
        if 'exp' in extra:
            jwt_token['exp'] = extra['exp']
        else:
            jwt_token['exp'] = datetime.datetime.utcnow() + datetime.timedelta(hours=1)

        if 'secret_key' in extra:
            secret_key = extra['secret_key']

        encoded_token = jwt.encode(jwt_token, secret_key, algorithm='HS256')
        auth = 'JWT %s' % encoded_token.decode('utf8')

        return auth

    def authenticated_post(self, url, data, **extra):
        auth = self.get_auth(**extra)
        response = self.client.post(url, data, HTTP_AUTHORIZATION=auth, **extra)
        return response
