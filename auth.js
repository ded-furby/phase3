// Authentication functionality for login and signup
document.addEventListener('DOMContentLoaded', () => {
    // Common form input effects
    const setupFormInputEffects = () => {
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
    };

    // Initialize form effects
    setupFormInputEffects();

    // Handle login form if it exists on the page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Basic validation
            if (username === '' || password === '') {
                showMessage('Please enter both username and password', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('.btn-login');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            try {
                // Send login request to server
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store user info in session storage
                    sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    showMessage(data.error || 'Login failed', 'error');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Authentication error:', error);
                console.log('Falling back to client-side authentication');
                
                // Fallback to direct JSON file access for demo purposes
                try {
                    const response = await fetch('users.json');
                    const data = await response.json();
                    
                    // Check if user exists and password matches
                    const user = data.users.find(u => u.username === username && u.password === password);
                    
                    if (user) {
                        // Store user info in session storage
                        sessionStorage.setItem('currentUser', JSON.stringify({
                            username: user.username,
                            email: user.email,
                            role: user.role
                        }));
                        
                        // Redirect based on user role
                        redirectBasedOnRole(user.role);
                    } else {
                        // Try checking localStorage as a last resort
                        const localUsers = localStorage.getItem('users');
                        if (localUsers) {
                            const parsedUsers = JSON.parse(localUsers);
                            const localUser = parsedUsers.users.find(u => u.username === username && u.password === password);
                            
                            if (localUser) {
                                // Store user info in session storage
                                sessionStorage.setItem('currentUser', JSON.stringify({
                                    username: localUser.username,
                                    email: localUser.email,
                                    role: localUser.role
                                }));
                                
                                // Redirect to dashboard
                                window.location.href = 'dashboard.html';
                                return;
                            }
                        }
                        
                        showMessage('Invalid username or password', 'error');
                    }
                } catch (fallbackError) {
                    console.error('Fallback authentication error:', fallbackError);
                    
                    // Try checking localStorage as a last resort
                    const localUsers = localStorage.getItem('users');
                    if (localUsers) {
                        try {
                            const parsedUsers = JSON.parse(localUsers);
                            const localUser = parsedUsers.users.find(u => u.username === username && u.password === password);
                            
                            if (localUser) {
                                // Store user info in session storage
                                sessionStorage.setItem('currentUser', JSON.stringify({
                                    username: localUser.username,
                                    email: localUser.email,
                                    role: localUser.role
                                }));
                                
                                // Redirect to dashboard
                                window.location.href = 'dashboard.html';
                                return;
                            }
                        } catch (e) {
                            console.error('Error parsing localStorage users:', e);
                        }
                    }
                    
                    showMessage('Authentication failed. Please try again.', 'error');
                }
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Handle signup form if it exists on the page
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();
            
            // Basic validation
            if (username === '' || email === '' || password === '' || confirmPassword === '') {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = signupForm.querySelector('.btn-login');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;
            
            try {
                // Send registration request to server
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store user info in session storage
                    sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                    
                    // Show success message and redirect after a delay
                    showMessage('Account created successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    showMessage(data.error || 'Registration failed', 'error');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Registration error:', error);
                console.log('Falling back to client-side registration');
                
                // Fallback to client-side registration for demo purposes
                try {
                    const response = await fetch('users.json');
                    const data = await response.json();
                    
                    // Check if username already exists
                    if (data.users.some(u => u.username === username)) {
                        showMessage('Username already exists', 'error');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        return;
                    }
                    
                    // Also check localStorage for existing users
                    const localUsers = localStorage.getItem('users');
                    if (localUsers) {
                        const parsedUsers = JSON.parse(localUsers);
                        if (parsedUsers.users.some(u => u.username === username)) {
                            showMessage('Username already exists', 'error');
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                            return;
                        }
                        
                        // Use the localStorage data as it might be more up-to-date
                        data.users = parsedUsers.users;
                    }
                    
                    // Create new user object
                    const newUser = {
                        username,
                        password,
                        email,
                        role: 'user',
                        created_at: new Date().toISOString()
                    };
                    
                    // Add user to the data
                    data.users.push(newUser);
                    
                    // Store user info in session storage
                    sessionStorage.setItem('currentUser', JSON.stringify({
                        username: newUser.username,
                        email: newUser.email,
                        role: newUser.role
                    }));
                    
                    // Store the updated users in localStorage as a fallback
                    localStorage.setItem('users', JSON.stringify(data));
                    
                    // Show success message and redirect after a delay
                    showMessage('Account created successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } catch (fallbackError) {
                    console.error('Fallback registration error:', fallbackError);
                    
                    // Create a new users object if all else fails
                    try {
                        const newUser = {
                            username,
                            password,
                            email,
                            role: 'user',
                            created_at: new Date().toISOString()
                        };
                        
                        const newData = {
                            users: [
                                {
                                    username: "admin",
                                    password: "admin123",
                                    email: "admin@chickenjockey.com",
                                    role: "admin",
                                    created_at: "2023-01-01T00:00:00Z"
                                },
                                newUser
                            ]
                        };
                        
                        // Store user info in session storage
                        sessionStorage.setItem('currentUser', JSON.stringify({
                            username: newUser.username,
                            email: newUser.email,
                            role: newUser.role
                        }));
                        
                        // Store the new users in localStorage
                        localStorage.setItem('users', JSON.stringify(newData));
                        
                        // Show success message and redirect after a delay
                        showMessage('Account created successfully! Redirecting...', 'success');
                        setTimeout(() => {
                            redirectBasedOnRole(newUser.role);
                        }, 1500);
                        return;
                    } catch (e) {
                        console.error('Final fallback error:', e);
                    }
                    
                    showMessage('Registration failed. Please try again.', 'error');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // Helper function to show messages
    function showMessage(message, type) {
        // Check if message container exists, if not create it
        let messageContainer = document.querySelector('.message-container');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.className = 'message-container';
            document.querySelector('.login-card').prepend(messageContainer);
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // Add to container
        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageElement);
        
        // Auto remove after a delay
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                if (messageContainer.contains(messageElement)) {
                    messageContainer.removeChild(messageElement);
                }
            }, 500);
        }, 3000);
    }
});

// Add subtle animation effect
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    const card = document.querySelector('.login-card');
    if (card) {
        card.classList.add('animate-in');
    }
});

// Function to redirect users based on their role
function redirectBasedOnRole(role) {
    if (role === 'admin') {
        window.location.href = 'dashboard.html'; // Admin dashboard
    } else if (role === 'commander') {
        window.location.href = 'dashboard.html'; // Commander dashboard
    } else {
        window.location.href = 'dashboard.html?mode=user'; // User dashboard with limited access
    }
}