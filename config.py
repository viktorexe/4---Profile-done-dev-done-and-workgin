# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Use a fixed secret key for development (in production, use environment variables)
    SECRET_KEY = 'your-super-secret-key-here'  # Change this to a secure random key
    
    # Email configuration
    MAIL_SERVER = 'smtp-relay.brevo.com'
    MAIL_PORT = 587
    MAIL_USERNAME = '8787e4001@smtp-brevo.com'
    MAIL_PASSWORD = 'xsmtpsib-9c9fa3ae0fc3121909add89c8cb007f62db417c906f0b3079ea278e57635efca-y2NTqMtpg8D6nshC'
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    SENDER_EMAIL = 'mujtasknext@gmail.com'

    # Session configuration
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = 1800  # 30 minutes
