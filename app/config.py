import os
from datetime import timedelta
from flask import url_for

class Config(object):

    DATABASE = {
        'name': 'vlaskola',
        'engine': 'peewee.PostgresqlDatabase',
        'user': 'postgres'
    }

    SECRET_KEY = os.environ.get("SECRET_KEY")

    SECURITY_REGISTERABLE = True
    SECURITY_SEND_REGISTER_EMAIL = False
    SECURITY_PASSWORD_SALT = os.environ.get(
        "SECURITY_PASSWORD_SALT")
    SECURITY_FLASH_MESSAGES = False
    SECURITY_URL_PREFIX = '/api/accounts'
    SECURITY_REDIRECT_BEHAVIOR = "spa"
    SECURITY_CSRF_PROTECT_MECHANISMS = ["session", "basic"]
    SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS = True
    SECURITY_CSRF_COOKIE = {"key": "XSRF-TOKEN"}

    WTF_CSRF_CHECK_DEFAULT = False
    WTF_CSRF_TIME_LIMIT = None
