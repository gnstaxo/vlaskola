from playhouse.flask_utils import FlaskDB
db = FlaskDB()

from flask_security import Security
security = Security()

from flask_wtf import CSRFProtect
csrf = CSRFProtect()
