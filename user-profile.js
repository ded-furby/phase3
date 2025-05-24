// User Profile Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Load user information from sessionStorage
    loadUserInfo();
    
    // Setup user profile dropdown
    setupUserProfileDropdown();
});

// Load user information from sessionStorage
function loadUserInfo() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser) {
        // Update username in the top bar
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = currentUser.username.toUpperCase();
        }
        
        // Update dropdown user information if dropdown exists
        const userDropdown = document.getElementById('user-dropdown');
        if (userDropdown) {
            const userFullname = document.getElementById('user-fullname');
            const userRole = document.getElementById('user-role');
            const dropdownUsername = document.getElementById('dropdown-username');
            const dropdownEmail = document.getElementById('dropdown-email');
            
            if (userFullname) userFullname.textContent = currentUser.username;
            if (userRole) userRole.textContent = `Role: ${currentUser.role}`;
            if (dropdownUsername) dropdownUsername.textContent = currentUser.username;
            if (dropdownEmail) dropdownEmail.textContent = currentUser.email;
        }
    } else {
        // Redirect to login if no user is found
        window.location.href = 'login.html';
    }
}

// Setup user profile dropdown functionality
function setupUserProfileDropdown() {
    const userProfile = document.getElementById('user-profile');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (userProfile && userDropdown) {
        // Toggle dropdown when clicking on the user profile
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userProfile.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    // Handle logout button click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear user session
            sessionStorage.removeItem('currentUser');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
} 