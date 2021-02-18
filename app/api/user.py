from flask_restful import (Resource, reqparse, marshal_with, request,
    marshal, fields)
from flask_security import roles_required, hash_password
from app.api import api
from app.models import User, user_datastore

user_fields = {
    "id":   fields.Integer,
    "email": fields.String,
    "roles": fields.List(fields.Nested({"name": fields.String}))
}

class UserList(Resource):

    @roles_required("admin")
    @marshal_with(user_fields)
    def get(self):
        return list(User.select())

    @roles_required("admin")
    @marshal_with(user_fields)
    def post(self):
        parser = reqparse.RequestParser()

        parser.add_argument('email')
        parser.add_argument('password')

        args = parser.parse_args()

        return user_datastore.create_user(email=args["email"],
            password=hash_password(args["password"]))

class UserDetail(Resource):

    @roles_required("admin")
    @marshal_with(user_fields)
    def put(self, id):

        parser = reqparse.RequestParser()
        parser.add_argument('roles')

        args = parser.parse_args()
        user = User.get(User.id == id)

        user_roles = [role.name for role in list(user.roles.select())]

        roles = args['roles'].strip(",").replace(" ", "").split(",")

        for role in roles:
            if role not in user_roles:
                user_datastore.add_role_to_user(user, role)

        for role in user_roles:
            if role not in roles:
                user_datastore.remove_role_from_user(user, role)

        return user

    @roles_required("admin")
    def delete(self, id):

        user = User.get(User.id == id)
        user_datastore.delete_user(user)

        return "Deleted"

api.add_resource(UserList, '/users/')
api.add_resource(UserDetail, '/user/<int:id>')
