# routes/id_management.py
from flask import request, jsonify, send_file
from . import id_management_bp
from .auth import login_required
import os
from PIL import Image

@id_management_bp.route('/upload_id', methods=['POST'])
@login_required
def upload_id():
    try:
        from flask import session
        username = session['user']
        id_type = request.form.get('id_type')
        file = request.files.get('file')
        
        if not file or not id_type:
            return jsonify({'error': 'Missing file or ID type'}), 400
        
        if id_type not in ['muj', 'govt']:
            return jsonify({'error': 'Invalid ID type'}), 400
        
        user_dir = f"data/{username}"
        os.makedirs(user_dir, exist_ok=True)
        
        filename = f"{id_type}_id.jpg"
        file_path = os.path.join(user_dir, filename)
        
        img = Image.open(file)
        img = img.convert('RGB')
        img.save(file_path, 'JPEG', quality=85)
        
        return jsonify({'success': True, 'message': f'{id_type.upper()} ID uploaded successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@id_management_bp.route('/view_id/<type>')
@login_required
def view_id(type):
    try:
        from flask import session
        username = session['user']
        
        if type not in ['muj', 'govt']:
            return "Invalid ID type", 400
        
        file_path = f"data/{username}/{type}_id.jpg"
        
        if not os.path.exists(file_path):
            return "ID not found", 404
        
        return send_file(file_path, mimetype='image/jpeg')
    except Exception as e:
        return str(e), 500
