// Profile Panel Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Profile elements
    const profileButton = document.getElementById('profileButton');
    const profileOverlay = document.getElementById('profileOverlay');
    const closeProfile = document.getElementById('closeProfile');
    let cropper = null;

    // Profile picture elements
    const profileImageInput = document.getElementById('profileImageInput');
    const changeProfilePic = document.getElementById('changeProfilePic');
    const cropperModal = document.getElementById('cropperModal');
    const cropperImage = document.getElementById('cropperImage');
    const saveCrop = document.getElementById('saveCrop');
    const cancelCrop = document.getElementById('cancelCrop');

    // ID upload elements
    const mujIdInput = document.getElementById('mujIdInput');
    const govtIdInput = document.getElementById('govtIdInput');
    const uploadMujId = document.getElementById('uploadMujId');
    const uploadGovtId = document.getElementById('uploadGovtId');
    const viewMujId = document.getElementById('viewMujId');
    const viewGovtId = document.getElementById('viewGovtId');

    // Profile Button Click Handler
    if (profileButton) {
        profileButton.addEventListener('click', () => {
            profileOverlay.classList.add('active');
            loadUserData();
        });
    }

    // Close Profile Handlers
    if (closeProfile) {
        closeProfile.addEventListener('click', () => {
            profileOverlay.classList.remove('active');
        });
    }

    // Close when clicking outside the profile panel
    if (profileOverlay) {
        profileOverlay.addEventListener('click', (e) => {
            if (e.target === profileOverlay) {
                profileOverlay.classList.remove('active');
            }
        });

        // Prevent closing when clicking inside profile panel
        const profilePanel = profileOverlay.querySelector('.profile-panel');
        if (profilePanel) {
            profilePanel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    // Profile Picture Change Handler
    if (changeProfilePic) {
        changeProfilePic.addEventListener('click', () => {
            profileImageInput.click();
        });
    }

    // Profile Image Input Change Handler
    if (profileImageInput) {
        profileImageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    cropperImage.src = e.target.result;
                    cropperModal.style.display = 'block';
                    
                    if (cropper) {
                        cropper.destroy();
                    }
                    
                    cropper = new Cropper(cropperImage, {
                        aspectRatio: 1,
                        viewMode: 2,
                        background: false,
                        zoomable: true,
                        cropBoxResizable: true
                    });
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    // Cropper Save Handler
    if (saveCrop) {
        saveCrop.addEventListener('click', () => {
            const canvas = cropper.getCroppedCanvas({
                width: 300,
                height: 300
            });
            document.getElementById('profileImage').src = canvas.toDataURL();
            cropperModal.style.display = 'none';
            cropper.destroy();
            cropper = null;
        });
    }

    // Cropper Cancel Handler
    if (cancelCrop) {
        cancelCrop.addEventListener('click', () => {
            cropperModal.style.display = 'none';
            cropper.destroy();
            cropper = null;
        });
    }

    // ID Upload Handlers
    if (uploadMujId && mujIdInput) {
        uploadMujId.addEventListener('click', () => mujIdInput.click());
        mujIdInput.addEventListener('change', (e) => handleIdUpload('muj', e));
    }

    if (uploadGovtId && govtIdInput) {
        uploadGovtId.addEventListener('click', () => govtIdInput.click());
        govtIdInput.addEventListener('change', (e) => handleIdUpload('govt', e));
    }

    if (viewMujId) {
        viewMujId.addEventListener('click', () => viewId('muj'));
    }

    if (viewGovtId) {
        viewGovtId.addEventListener('click', () => viewId('govt'));
    }

    // Complete Profile Handler
    const completeProfileButton = document.getElementById('completeProfile');
    if (completeProfileButton) {
        completeProfileButton.addEventListener('click', saveProfile);
    }
});

// Load User Data Function
async function loadUserData() {
    try {
        const response = await fetch('/get_user_data');
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const userData = await response.json();
        
        // Update form fields
        document.getElementById('username').value = userData.username;
        document.getElementById('email').value = userData.email;
        document.getElementById('regDate').value = userData.registration_date;
        
        // Update profile picture if exists
        if (userData.profile_picture) {
            document.getElementById('profileImage').src = userData.profile_picture;
        }
        
        // Update ID buttons visibility
        if (userData.muj_id) {
            document.getElementById('uploadMujId').style.display = 'none';
            document.getElementById('viewMujId').style.display = 'block';
        }
        
        if (userData.govt_id) {
            document.getElementById('uploadGovtId').style.display = 'none';
            document.getElementById('viewGovtId').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error loading user data', 'error');
    }
}

// Handle ID Upload Function
async function handleIdUpload(type, event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size should be less than 5MB', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('id_type', type);
    formData.append('file', file);

    try {
        const response = await fetch('/upload_id', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to upload ID');
        
        const uploadButton = document.getElementById(`upload${type.charAt(0).toUpperCase() + type.slice(1)}Id`);
        const viewButton = document.getElementById(`view${type.charAt(0).toUpperCase() + type.slice(1)}Id`);
        
        uploadButton.style.display = 'none';
        viewButton.style.display = 'block';
        
        showNotification('ID uploaded successfully', 'success');
    } catch (error) {
        console.error('Error uploading ID:', error);
        showNotification('Error uploading ID', 'error');
    }
}

// View ID Function
function viewId(type) {
    window.open(`/view_id/${type}`, '_blank');
}

// Save Profile Function
async function saveProfile() {
    try {
        const profileData = {
            username: document.getElementById('username').value,
            profile_picture: document.getElementById('profileImage').src
        };

        const response = await fetch('/save_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) throw new Error('Failed to save profile');

        showNotification('Profile saved successfully', 'success');
        document.getElementById('profileOverlay').classList.remove('active');
        
        // Reload page after short delay
        setTimeout(() => {
            location.reload();
        }, 1500);
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Error saving profile', 'error');
    }
}

// Notification Function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add notification to document
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
}

.notification.success {
    background-color: #4CAF50;
}

.notification.error {
    background-color: #f44336;
}

.notification.info {
    background-color: #2196F3;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Add notification styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
