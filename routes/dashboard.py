# routes/dashboard.py
from flask import render_template, session
from . import dashboard_bp
from .auth import login_required

@dashboard_bp.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', username=session['user'])
