import string, random
from peewee import *
from flask_security import UserMixin, RoleMixin, PeeweeUserDatastore

from app.extensions import db

class Role(RoleMixin, db.Model):
    name = CharField(unique=True)
    description = TextField(null=True)
    permissions = TextField(null=True)

class User(UserMixin, db.Model):
    email = TextField()
    password = TextField()
    active = BooleanField(default=True)
    fs_uniquifier = TextField(null=False)
    confirmed_at = DateTimeField(null=True)

class UserRoles(db.Model):
    user = ForeignKeyField(User, related_name='roles')
    role = ForeignKeyField(Role, related_name='users')
    name = property(lambda self: self.role.name)
    description = property(lambda self: self.role.description)

    def get_permissions(self):
        return self.role.get_permissions()

user_datastore = PeeweeUserDatastore(db, User, Role, UserRoles)

def random_node_id():
    return ''.join(random.choices(
        string.ascii_uppercase + string.digits, k=8))

class Exam(db.Model):
    node_id = CharField(default=random_node_id)
    name = CharField()
    description = CharField()
    json_file = CharField()
    time = SmallIntegerField(default=10)
    attempts = SmallIntegerField(default=2)
    roles = CharField(default="")
    locked = BooleanField(default=False)

class Attempt(db.Model):
    user = ForeignKeyField(User, backref="attempts")
    exam = ForeignKeyField(Exam, on_delete='CASCADE')
    time_start = DateTimeField()
    times = IntegerField(default=1)
    answers = TextField(default='{}')
    correct = IntegerField(default=0)
    incorrect = IntegerField(default=0)

