# routes/auth.py
from flask import render_template, request, jsonify, session, redirect, url_for
from . import auth_bp
import hashlib
import json
import os
import random
from datetime import datetime, timedelta
from flask_mail import Message
from functools import wraps

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    user_dir = f"data/{username}"
    os.makedirs(user_dir, exist_ok=True)

    otp = str(random.randint(100000, 999999))
    
    session['otp'] = otp
    session['otp_expiry'] = (datetime.now() + timedelta(minutes=5)).timestamp()
    session['pending_user'] = {
        'username': username,
        'email': email,
        'password': hash_password(password)
    }

    try:
        from app import mail
        msg = Message(
            'TaskNext - Email Verification',
            sender=os.getenv('SENDER_EMAIL'),
            recipients=[email]
        )
        msg.body = f'Your OTP for TaskNext registration is: {otp}'
        mail.send(msg)
        return jsonify({'success': True, 'message': 'OTP sent successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    user_otp = data.get('otp')
    
    if 'otp' not in session:
        return jsonify({'success': False, 'message': 'No OTP request found'})

    if datetime.now().timestamp() > session['otp_expiry']:
        return jsonify({'success': False, 'message': 'OTP expired'})

    if user_otp == session['otp']:
        user_data = session['pending_user']
        user_file = f"data/{user_data['username']}/{user_data['username']}.json"
        
        with open(user_file, 'w') as f:
            json.dump(user_data, f)
        
        session.pop('otp', None)
        session.pop('otp_expiry', None)
        session.pop('pending_user', None)
        
        return jsonify({'success': True, 'message': 'Registration successful'})
    
    return jsonify({'success': False, 'message': 'Invalid OTP'})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    remember = data.get('remember', False)

    user_file = f"data/{username}/{username}.json"
    
    try:
        with open(user_file, 'r') as f:
            user_data = json.load(f)
            
        if user_data['password'] == hash_password(password):
            session['user'] = username
            if remember:
                session.permanent = True
            return jsonify({'success': True, 'message': 'Login successful'})
    except FileNotFoundError:
        pass
    
    return jsonify({'success': False, 'message': 'Invalid credentials'})

@auth_bp.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('main.index'))

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    username = data.get('username')
    
    user_file = f"data/{username}/{username}.json"
    try:
        with open(user_file, 'r') as f:
            user_data = json.load(f)
            
        reset_token = os.urandom(16).hex()
        session[f'reset_token_{username}'] = reset_token
        
        from app import mail
        msg = Message(
            'TaskNext - Password Reset',
            sender=os.getenv('SENDER_EMAIL'),
            recipients=[user_data['email']]
        )
        msg.body = f'Click here to reset your password: http://localhost:5000/reset-password/{reset_token}'
        mail.send(msg)
        
        return jsonify({'success': True, 'message': 'Reset instructions sent to email'})
    except FileNotFoundError:
        return jsonify({'success': False, 'message': 'User not found'})
