#!/usr/bin/env python
from flask import Blueprint
from flask_restful import Api

api_blueprint = Blueprint("api", __name__, url_prefix='/api')
api = Api(api_blueprint)

from . import user
from . import exam
