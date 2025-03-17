# routes/__init__.py
from flask import Blueprint

auth_bp = Blueprint('auth', __name__)
profile_bp = Blueprint('profile', __name__)
dashboard_bp = Blueprint('dashboard', __name__)
id_management_bp = Blueprint('id_management', __name__)
main_bp = Blueprint('main', __name__)

from . import auth, profile, dashboard, id_management, main
