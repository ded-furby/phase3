// Login Form Functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Add visual feedback when inputs are focused
    const formInputs = document.querySelectorAll('.form-group input');
    formInputs.forEach(input => {
        // Add focus effect
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        // Remove focus effect
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            
            // Validate on blur
            if (input.value.trim() !== '') {
                input.classList.add('valid');
                input.classList.remove('invalid');
            } else {
                input.classList.add('invalid');
                input.classList.remove('valid');
            }
        });
    });

    // Form submission handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic validation
        let isValid = true;
        
        if (usernameInput.value.trim() === '') {
            usernameInput.classList.add('invalid');
            isValid = false;
        }
        
        if (passwordInput.value.trim() === '') {
            passwordInput.classList.add('invalid');
            isValid = false;
        }
        
        if (isValid) {
            // Show loading state
            const submitBtn = loginForm.querySelector('.btn-login');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            // Simulate login process (replace with actual authentication)
            setTimeout(() => {
                // Demo - successful login redirect
                // In a real application, this would be handled by server response
                
                // Redirect to dashboard page
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    });

    // Toggle password visibility functionality
    const togglePassword = () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    };

    // Add password toggle if needed
    // const passwordToggle = document.createElement('button');
    // passwordToggle.type = 'button';
    // passwordToggle.textContent = 'Show';
    // passwordToggle.classList.add('password-toggle');
    // passwordToggle.addEventListener('click', togglePassword);
    // passwordInput.parentElement.appendChild(passwordToggle);
});

// Add subtle animation effect
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    document.querySelector('.login-card').classList.add('animate-in');
}); 