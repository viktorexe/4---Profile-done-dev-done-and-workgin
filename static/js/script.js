// Theme Management
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
});

// Theme Switcher
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
});

// Toast Notification System
const showToast = (title, message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="toast-icon fas ${type === 'success' ? 'fa-check-circle' : 
                                 type === 'error' ? 'fa-exclamation-circle' :
                                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.querySelector('.toast-container').appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutLeft 0.3s ease forwards';  // Changed from slideOutRight
        setTimeout(() => toast.remove(), 300);
    }, 5000);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideOutLeft 0.3s ease forwards';  // Changed from slideOutRight
        setTimeout(() => toast.remove(), 300);
    });
};

// Form Navigation
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and forms
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.form-section').forEach(form => {
            form.classList.remove('active');
            form.style.animation = '';
        });
        
        // Add active class to clicked button and corresponding form
        button.classList.add('active');
        const formId = button.getAttribute('data-form');
        const targetForm = document.getElementById(`${formId}-form`);
        targetForm.classList.add('active');
        targetForm.style.animation = 'slideIn 0.5s ease forwards';
    });
});

// Form Validation
function validateForm(formData) {
    const errors = {};
    
    if (formData.username && formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters long';
    }
    
    if (formData.password && formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    return errors;
}

// Login Handler
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me').checked;

    const errors = validateForm({ username, password });
    if (Object.keys(errors).length > 0) {
        showToast('Error', Object.values(errors)[0], 'error');
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, remember })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Success', 'Login successful!', 'success');
            // Redirect to dashboard after successful login
            window.location.href = '/dashboard';
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        showToast('Error', 'An error occurred. Please try again.', 'error');
    }
}


// Signup Handler
async function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const errors = validateForm({ username, email, password });
    if (Object.keys(errors).length > 0) {
        showToast('Error', Object.values(errors)[0], 'error');
        return;
    }

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Success', 'Signup successful! Please verify your email.', 'success');
            // Show OTP form
            document.querySelectorAll('.form-section').forEach(form => form.classList.remove('active'));
            document.getElementById('otp-form').classList.add('active');
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        showToast('Error', 'An error occurred. Please try again.', 'error');
    }
}

// OTP Input Handling
document.querySelectorAll('.otp-digit').forEach((input, index) => {
    input.addEventListener('keyup', (e) => {
        if (e.key >= 0 && e.key <= 9) {
            if (index < 5) {
                document.querySelectorAll('.otp-digit')[index + 1].focus();
            }
        } else if (e.key === 'Backspace') {
            if (index > 0) {
                document.querySelectorAll('.otp-digit')[index - 1].focus();
            }
        }
    });

    // Paste handling
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6);
        const inputs = document.querySelectorAll('.otp-digit');
        pasteData.split('').forEach((char, i) => {
            if (i < inputs.length) {
                inputs[i].value = char;
                if (i === inputs.length - 1) inputs[i].focus();
            }
        });
    });
});

// OTP Verification Handler
async function handleOTPVerification(event) {
    event.preventDefault();
    
    const otpInputs = document.querySelectorAll('.otp-digit');
    const otp = Array.from(otpInputs).map(input => input.value).join('');

    if (otp.length !== 6) {
        showToast('Error', 'Please enter a valid 6-digit OTP', 'error');
        return;
    }

    try {
        const response = await fetch('/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Success', 'Email verified successfully!', 'success');
            setTimeout(() => {
                document.querySelector('[data-form="login"]').click();
            }, 1500);
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        showToast('Error', 'An error occurred. Please try again.', 'error');
    }
}

// Reset Password Handler
async function handleResetPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('reset-email').value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Error', 'Please enter a valid email address', 'error');
        return;
    }

    try {
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Success', 'Password reset link sent to your email!', 'success');
            setTimeout(() => showLoginForm(), 1500);
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        showToast('Error', 'An error occurred. Please try again.', 'error');
    }
}

// Navigation Helpers
function showLoginForm() {
    document.querySelector('[data-form="login"]').click();
}

function showResetForm(event) {
    event.preventDefault();
    document.querySelectorAll('.form-section').forEach(form => form.classList.remove('active'));
    document.getElementById('reset-form').classList.add('active');
}

// Resend OTP Handler
document.querySelector('.resend-btn')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Success', 'OTP resent successfully!', 'success');
        } else {
            showToast('Error', data.message, 'error');
        }
    } catch (error) {
        showToast('Error', 'An error occurred. Please try again.', 'error');
    }
});
