# app.py
from flask import Flask
from flask_mail import Mail
from flask_session import Session
from config import Config
import os
from flask_mail import Mail
from flask_session import Session
import requests
import json

from flask_mail import Mail
from flask_session import Session

# Create the objects
mail = Mail()
sess = Session()


from upstash_redis import Redis

redis = Redis(
    url=os.getenv('UPSTASH_REDIS_URL'),
    token=os.getenv('UPSTASH_REDIS_TOKEN')
)

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Ensure the secret key is set
    if not app.secret_key:
        app.secret_key = Config.SECRET_KEY

    # Initialize extensions
    mail.init_app(app)
    sess.init_app(app)

    # Import blueprints
    from routes import auth_bp, profile_bp, dashboard_bp, id_management_bp, main_bp

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(id_management_bp)
    app.register_blueprint(main_bp)

    # Create necessary directories
    os.makedirs('data', exist_ok=True)
    os.makedirs('flask_session', exist_ok=True)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
