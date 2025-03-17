# routes/profile.py
from flask import jsonify, request, session
from . import profile_bp
from .auth import login_required
import os
import json
from datetime import datetime
from PIL import Image
import io
import base64

@profile_bp.route('/get_user_data')
@login_required
def get_user_data():
    try:
        username = session['user']
        user_file = f"data/{username}/{username}.json"
        
        with open(user_file, 'r') as f:
            user_data = json.load(f)
        
        if 'registration_date' not in user_data:
            user_data['registration_date'] = datetime.now().strftime('%Y-%m-%d')
        
        profile_pic_path = f"data/{username}/profile_picture.jpg"
        if os.path.exists(profile_pic_path):
            with open(profile_pic_path, 'rb') as img_file:
                profile_pic = base64.b64encode(img_file.read()).decode('utf-8')
                user_data['profile_picture'] = f"data:image/jpeg;base64,{profile_pic}"
        
        user_data['muj_id'] = os.path.exists(f"data/{username}/muj_id.jpg")
        user_data['govt_id'] = os.path.exists(f"data/{username}/govt_id.jpg")
        
        return jsonify(user_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/save_profile', methods=['POST'])
@login_required
def save_profile():
    try:
        username = session['user']
        data = request.json
        
        user_file = f"data/{username}/{username}.json"
        with open(user_file, 'r') as f:
            user_data = json.load(f)
        
        new_username = data.get('username')
        if new_username and new_username != username and new_username != user_data['username']:
            if os.path.exists(f"data/{new_username}"):
                return jsonify({'error': 'Username already taken'}), 400
            
            os.rename(f"data/{username}", f"data/{new_username}")
            session['user'] = new_username
            user_data['username'] = new_username
        
        profile_pic_data = data.get('profile_picture')
        if profile_pic_data and 'base64' in profile_pic_data:
            image_data = profile_pic_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            
            img = Image.open(io.BytesIO(image_bytes))
            img = img.convert('RGB')
            profile_pic_path = f"data/{new_username or username}/profile_picture.jpg"
            img.save(profile_pic_path, 'JPEG', quality=85)
        
        user_file = f"data/{new_username or username}/{new_username or username}.json"
        with open(user_file, 'w') as f:
            json.dump(user_data, f)
        
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
