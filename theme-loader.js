/**
 * Theme Loader Script
 * Loads and applies saved theme settings to any page that includes this script
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load theme settings
    const savedSettings = JSON.parse(localStorage.getItem('systemSettings')) || {};
    
    // Apply theme - ensure it happens immediately
    if (savedSettings.appearance && savedSettings.appearance.theme) {
        const theme = savedSettings.appearance.theme.toLowerCase();
        document.body.setAttribute('data-theme', theme);
        console.log('Applied theme:', theme);
    } else {
        // Default theme
        document.body.setAttribute('data-theme', 'dark');
        console.log('Applied default dark theme');
    }
    
    // Apply font size
    if (savedSettings.appearance && savedSettings.appearance.fontSize) {
        const fontSizeClass = `font-${savedSettings.appearance.fontSize.toLowerCase()}`;
        document.body.classList.add(fontSizeClass);
    }
    
    // Apply compact mode
    if (savedSettings.appearance && savedSettings.appearance.compactMode) {
        document.body.classList.add('compact-mode');
    }
    
    // Load system name and update UI
    loadSystemName();
    
    // Add click event to the logo
    setupLogoClick();
    
    console.log('Theme and system name loaded from settings');
});

// Function to load system name from settings and update UI
function loadSystemName() {
    try {
        const savedSettings = JSON.parse(localStorage.getItem('systemSettings')) || {};
        const defaultSystemName = 'Chicken Jockey Coordination System';
        const systemName = savedSettings.general?.systemName || defaultSystemName;
        
        // Generate abbreviation
        const abbreviation = generateAbbreviation(systemName);
        
        console.log('Loading system name:', systemName, 'Abbreviation:', abbreviation);
        
        // DON'T update logo in sidebar - keep the image
        // We want to keep the logo.png image instead of text
        
        // Update app title in topbar
        const appTitle = document.querySelector('.app-title');
        if (appTitle) {
            appTitle.textContent = systemName.toUpperCase();
            console.log('Updated app title to:', systemName.toUpperCase());
        } else {
            console.warn('App title element not found');
        }
        
        // Update page title
        document.title = systemName;
        console.log('Updated page title to:', systemName);
    } catch (error) {
        console.error('Error loading system name:', error);
    }
}

// Function to generate abbreviation from system name
function generateAbbreviation(name) {
    if (!name) return 'CJCS';
    
    // Split by spaces and get first letter of each word
    const words = name.split(' ');
    let abbreviation = '';
    
    for (const word of words) {
        if (word.length > 0) {
            abbreviation += word[0].toUpperCase();
        }
    }
    
    // If abbreviation is too long, limit it
    if (abbreviation.length > 6) {
        abbreviation = abbreviation.substring(0, 6);
    }
    
    return abbreviation;
}

// Function to setup click event on the logo
function setupLogoClick() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', showSystemInfo);
    }
}

// Function to show system info popup
function showSystemInfo() {
    try {
        // Get system settings
        const savedSettings = JSON.parse(localStorage.getItem('systemSettings')) || {};
        const defaultSystemName = 'Chicken Jockey Coordination System';
        const defaultOrgId = 'CJCS-001';
        
        const systemName = savedSettings.general?.systemName || defaultSystemName;
        const organizationId = savedSettings.general?.organizationId || defaultOrgId;
        
        // Create system info popup if it doesn't exist
        let systemInfoPopup = document.getElementById('system-info-popup');
        if (!systemInfoPopup) {
            systemInfoPopup = document.createElement('div');
            systemInfoPopup.id = 'system-info-popup';
            systemInfoPopup.className = 'system-info-popup';
            document.body.appendChild(systemInfoPopup);
            
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.className = 'system-info-close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', function() {
                systemInfoPopup.classList.remove('active');
            });
            
            systemInfoPopup.appendChild(closeButton);
            
            // Close popup when clicking outside
            document.addEventListener('click', function(event) {
                if (systemInfoPopup.classList.contains('active') && 
                    !systemInfoPopup.contains(event.target) && 
                    event.target !== document.querySelector('.logo')) {
                    systemInfoPopup.classList.remove('active');
                }
            });
        }
        
        // Update popup content
        systemInfoPopup.innerHTML = `
            <button class="system-info-close">&times;</button>
            <div class="system-info-header">
                <h3>${systemName}</h3>
            </div>
            <div class="system-info-content">
                <div class="system-info-item">
                    <span class="info-label">Organization ID:</span>
                    <span class="info-value">${organizationId}</span>
                </div>
                <div class="system-info-item">
                    <span class="info-label">Description:</span>
                    <span class="info-value">A comprehensive system for coordinating and managing Chicken Jockey units in various operations. This platform allows for real-time tracking, mission planning, and secure communications between all field units.</span>
                </div>
                <div class="system-info-item">
                    <span class="info-label">Version:</span>
                    <span class="info-value">2.1.0</span>
                </div>
            </div>
        `;
        
        // Add active class to show the popup
        systemInfoPopup.classList.add('active');
        
        // Re-attach close button event
        const closeButton = systemInfoPopup.querySelector('.system-info-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                systemInfoPopup.classList.remove('active');
            });
        }
    } catch (error) {
        console.error('Error showing system info:', error);
    }
} 