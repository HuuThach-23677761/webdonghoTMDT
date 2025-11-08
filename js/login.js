// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

function initializeLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if already logged in
    if (window.authManager.isLoggedIn()) {
        // Redirect to appropriate page
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('return') || 'index.html';
        window.location.href = returnUrl;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Clear previous errors
    clearFormErrors();
    
    // Validate form
    if (!validateLoginForm(email, password)) {
        return;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
    
    try {
        const user = await window.authManager.login(email, password);
        
        // Show success toast
        showLoginToast();
        
        // Redirect after short delay
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const returnUrl = urlParams.get('return') || (user.role === 'admin' ? 'admin.html' : 'index.html');
            window.location.href = returnUrl;
        }, 1500);
        
    } catch (error) {
        showFormError('email', error.message);
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

function validateLoginForm(email, password) {
    let isValid = true;
    
    // Email validation
    if (!email) {
        showFormError('email', 'Email is required');
        isValid = false;
    } else if (!window.authManager.validateEmail(email)) {
        showFormError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        showFormError('password', 'Password is required');
        isValid = false;
    }
    
    return isValid;
}

function showFormError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const feedback = field.nextElementSibling;
    
    field.classList.add('is-invalid');
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    }
}

function clearFormErrors() {
    const fields = document.querySelectorAll('.form-control');
    fields.forEach(field => {
        field.classList.remove('is-invalid');
    });
    
    const feedbacks = document.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(feedback => {
        feedback.textContent = '';
    });
}

function showLoginToast() {
    const toast = document.getElementById('loginToast');
    if (toast) {
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}