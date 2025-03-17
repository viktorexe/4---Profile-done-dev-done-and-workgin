# routes/main.py
from flask import render_template, redirect, url_for, session
from . import main_bp

@main_bp.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('dashboard.dashboard'))
    return render_template('index.html')
