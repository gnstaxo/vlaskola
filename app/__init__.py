from flask import Flask, request
import click
from app.api import api_blueprint
from app.extensions import db, security, csrf
from app.models import User, Role, UserRoles, user_datastore, Exam, Attempt
from flask_security import PeeweeUserDatastore, user_registered
from .config import Config

def create_app():
    app = Flask(__name__,
        static_folder='static', static_url_path="/static")

    app.config.from_object(Config())

    db.init_app(app)

    csrf.init_app(app)

    security.init_app(app, user_datastore)

    app.cli.add_command(init_db_command)

    app.register_blueprint(api_blueprint)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        return app.send_static_file("index.html")


    return app

@click.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    db.database.drop_tables([User, Role, UserRoles, Exam, Attempt])
    db.database.create_tables([User, Role, UserRoles, Exam, Attempt])
    click.echo('Initialized the database.')

