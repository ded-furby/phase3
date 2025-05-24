document.addEventListener('DOMContentLoaded', function() {
    // Settings navigation functionality
    const settingsNavItems = document.querySelectorAll('.settings-nav-item');
    const settingsPanels = document.querySelectorAll('.settings-panel');

    settingsNavItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items and panels
            settingsNavItems.forEach(navItem => navItem.classList.remove('active'));
            settingsPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked item and corresponding panel
            item.classList.add('active');
            const panelId = item.getAttribute('data-tab');
            document.getElementById(panelId).classList.add('active');
        });
    });

    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.textContent.toLowerCase();
            if (page === 'missions') {
                window.location.href = 'dashboard.html';
            } else if (page === 'units') {
                window.location.href = 'units.html';
            } else if (page === 'tracking') {
                window.location.href = 'tracking.html';
            } else if (page === 'comms') {
                window.location.href = 'messaging.html';
            } else if (page === 'reports') {
                window.location.href = 'reports.html';
            }
        });
    });

    // Store original settings for comparison/reset
    const originalSettings = captureCurrentSettings();
    
    // Load current settings into the form
    loadSavedSettings();

    // System name input functionality
    const systemNameInput = document.querySelector('#general input[type="text"]');
    if (systemNameInput) {
        // Set the initial value from localStorage or use default
        const savedSettings = JSON.parse(localStorage.getItem('systemSettings')) || {};
        const defaultSystemName = 'Chicken Jockey Coordination System';
        systemNameInput.value = savedSettings.general?.systemName || defaultSystemName;
        
        // Add input event listener to show preview of the abbreviation
        systemNameInput.addEventListener('input', updateSystemNamePreview);
        
        // Initialize the preview
        updateSystemNamePreview();
    }
    
    // Organization ID input functionality
    const organizationIdInput = document.querySelectorAll('#general input[type="text"]')[1];
    if (organizationIdInput) {
        // Remove readonly attribute to make it editable
        organizationIdInput.removeAttribute('readonly');
        
        // Set the initial value from localStorage or use default
        const savedSettings = JSON.parse(localStorage.getItem('systemSettings')) || {};
        const defaultOrgId = 'CJCS-001';
        organizationIdInput.value = savedSettings.general?.organizationId || defaultOrgId;
    }

    // Live preview for appearance settings
    const themeSelect = document.querySelectorAll('#appearance select')[0];
    const fontSizeSelect = document.querySelectorAll('#appearance select')[1];
    const compactModeToggle = document.getElementById('compact-mode');

    // Add preview functionality - only apply when user changes the select
    themeSelect.addEventListener('change', previewAppearanceSettings);
    fontSizeSelect.addEventListener('change', previewAppearanceSettings);
    compactModeToggle.addEventListener('change', previewAppearanceSettings);

    // Cancel button functionality
    const cancelButton = document.querySelector('.btn-cancel');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            if (hasSettingsChanged(originalSettings)) {
                if (confirm('Discard changes? Any unsaved changes will be lost.')) {
                    restoreSettings(originalSettings);
                    resetAppearancePreview(); // Reset the preview to the saved settings
                    updateSystemNamePreview(); // Reset system name preview
                }
            } else {
                // No changes to discard, just reset the form
                resetSettingsForm();
            }
        });
    }

    // Save Changes functionality
    const saveButton = document.querySelector('.btn-save');
    saveButton.addEventListener('click', () => {
        // Show saving indicator
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;
        saveButton.classList.add('saving');
        
        // Simulate a delay to show the saving state
        setTimeout(() => {
            // Collect all settings values
            const settings = {
                general: {
                    systemName: document.querySelector('#general input[type="text"]').value,
                    organizationId: document.querySelectorAll('#general input[type="text"]')[1].value,
                    timeZone: document.querySelector('#general select').value,
                    dateFormat: document.querySelectorAll('#general select')[1].value,
                    timeFormat: document.querySelectorAll('#general select')[2].value
                },
                appearance: {
                    theme: document.querySelectorAll('#appearance select')[0].value,
                    fontSize: document.querySelectorAll('#appearance select')[1].value,
                    compactMode: document.getElementById('compact-mode').checked
                }
            };

            // Save settings to localStorage
            localStorage.setItem('systemSettings', JSON.stringify(settings));
            console.log('Saving settings:', settings);
            
            // Apply system name changes
            applySystemNameChanges(settings.general.systemName);
            
            // Show success message
            saveButton.textContent = 'Saved!';
            saveButton.classList.remove('saving');
            saveButton.classList.add('saved');
            
            // Reset button after a delay
            setTimeout(() => {
                saveButton.textContent = originalText;
                saveButton.disabled = false;
                saveButton.classList.remove('saved');
                
                // Update original settings after successful save
                Object.assign(originalSettings, settings);
                
                // Permanently apply the appearance settings now that they're saved
                applyAppearanceSettings();
                
                // Show toast notification
                showToast('Settings saved successfully!');
            }, 1500);
        }, 800);
    });

    // Toggle switch styling
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const label = this.nextElementSibling;
            if (this.checked) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
    });

    // Input validation
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
            
            // Enforce min/max if specified
            if (this.hasAttribute('min') && parseInt(this.value) < parseInt(this.getAttribute('min'))) {
                this.value = this.getAttribute('min');
            }
            
            if (this.hasAttribute('max') && parseInt(this.value) > parseInt(this.getAttribute('max'))) {
                this.value = this.getAttribute('max');
            }
        });
    });
    
    // Add hover effects for setting items
    const settingItems = document.querySelectorAll('.setting-item');
    settingItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
    
    // Helper function to capture current settings
    function captureCurrentSettings() {
        return {
            general: {
                systemName: document.querySelector('#general input[type="text"]').value,
                organizationId: document.querySelectorAll('#general input[type="text"]')[1].value,
                timeZone: document.querySelector('#general select').value,
                dateFormat: document.querySelectorAll('#general select')[1].value,
                timeFormat: document.querySelectorAll('#general select')[2].value
            },
            appearance: {
                theme: document.querySelectorAll('#appearance select')[0].value,
                fontSize: document.querySelectorAll('#appearance select')[1].value,
                compactMode: document.getElementById('compact-mode').checked
            }
        };
    }
    
    // Check if settings have changed
    function hasSettingsChanged(originalSettings) {
        const currentSettings = captureCurrentSettings();
        return JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
    }
    
    // Restore settings to original values
    function restoreSettings(originalSettings) {
        // General settings
        document.querySelector('#general input[type="text"]').value = originalSettings.general.systemName;
        document.querySelectorAll('#general input[type="text"]')[1].value = originalSettings.general.organizationId;
        document.querySelector('#general select').value = originalSettings.general.timeZone;
        document.querySelectorAll('#general select')[1].value = originalSettings.general.dateFormat;
        document.querySelectorAll('#general select')[2].value = originalSettings.general.timeFormat;
        
        // Appearance settings
        document.querySelectorAll('#appearance select')[0].value = originalSettings.appearance.theme;
        document.querySelectorAll('#appearance select')[1].value = originalSettings.appearance.fontSize;
        document.getElementById('compact-mode').checked = originalSettings.appearance.compactMode;
        
        // Update toggle switch styling
        updateToggleSwitchStyles();
        
        // Reset appearance preview
        resetAppearancePreview();
        
        // Show toast notification
        showToast('Changes discarded');
    }
    
    // Reset the form to default values
    function resetSettingsForm() {
        // You can define default values here if needed
        showToast('Form reset to original values');
    }
    
    // Load saved settings from localStorage
    function loadSavedSettings() {
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                // Apply saved settings to the form
                try {
                    // General settings
                    if (settings.general) {
                        if (settings.general.systemName) document.querySelector('#general input[type="text"]').value = settings.general.systemName;
                        if (settings.general.organizationId) document.querySelectorAll('#general input[type="text"]')[1].value = settings.general.organizationId;
                        if (settings.general.timeZone) document.querySelector('#general select').value = settings.general.timeZone;
                        if (settings.general.dateFormat) document.querySelectorAll('#general select')[1].value = settings.general.dateFormat;
                    }
                    
                    // Appearance settings
                    if (settings.appearance) {
                        // Set theme dropdown
                        const themeSelect = document.querySelectorAll('#appearance select')[0];
                        if (settings.appearance.theme && themeSelect) {
                            themeSelect.value = settings.appearance.theme;
                            console.log('Set theme dropdown to:', settings.appearance.theme);
                        }
                        
                        if (settings.appearance.fontSize) document.querySelectorAll('#appearance select')[1].value = settings.appearance.fontSize;
                        if (settings.appearance.compactMode !== undefined) document.getElementById('compact-mode').checked = settings.appearance.compactMode;
                    }
                    
                    // Update toggle switch styling
                    updateToggleSwitchStyles();
                    
                    console.log('Settings loaded from localStorage');
                } catch (error) {
                    console.error('Error loading settings:', error);
                }
            } catch (error) {
                console.error('Error parsing settings:', error);
            }
        }
    }
    
    // Update toggle switch styles based on checked state
    function updateToggleSwitchStyles() {
        const toggleSwitches = document.querySelectorAll('.toggle-switch input');
        toggleSwitches.forEach(toggle => {
            const label = toggle.nextElementSibling;
            if (toggle.checked) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
    }
    
    // Preview appearance settings without saving (for live preview)
    function previewAppearanceSettings() {
        // Get current appearance settings from the form
        const theme = document.querySelectorAll('#appearance select')[0].value;
        const fontSize = document.querySelectorAll('#appearance select')[1].value;
        const compactMode = document.getElementById('compact-mode').checked;
        
        // Store original classes to restore if needed
        if (!document.body.hasAttribute('data-original-classes')) {
            document.body.setAttribute('data-original-classes', document.body.className);
        }
        
        // Apply theme
        document.body.setAttribute('data-theme', theme.toLowerCase());
        
        // Apply font size
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${fontSize.toLowerCase()}`);
        
        // Apply compact mode
        if (compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    }
    
    // Reset appearance preview to saved settings
    function resetAppearancePreview() {
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                // Apply saved theme
                if (settings.appearance && settings.appearance.theme) {
                    document.body.setAttribute('data-theme', settings.appearance.theme.toLowerCase());
                } else {
                    // Default theme
                    document.body.setAttribute('data-theme', 'dark');
                }
                
                // Reset other appearance settings
                if (settings.appearance) {
                    // Font size
                    document.body.classList.remove('font-small', 'font-medium', 'font-large');
                    if (settings.appearance.fontSize) {
                        document.body.classList.add(`font-${settings.appearance.fontSize.toLowerCase()}`);
                    } else {
                        document.body.classList.add('font-medium');
                    }
                    
                    // Compact mode
                    if (settings.appearance.compactMode) {
                        document.body.classList.add('compact-mode');
                    } else {
                        document.body.classList.remove('compact-mode');
                    }
                }
            } catch (error) {
                console.error('Error resetting appearance preview:', error);
                // Default theme if error
                document.body.setAttribute('data-theme', 'dark');
            }
        } else {
            // Default theme if no saved settings
            document.body.setAttribute('data-theme', 'dark');
        }
    }
    
    // Apply appearance settings permanently (when saving)
    function applyAppearanceSettings() {
        // Get current appearance settings
        const theme = document.querySelectorAll('#appearance select')[0].value;
        const fontSize = document.querySelectorAll('#appearance select')[1].value;
        const compactMode = document.getElementById('compact-mode').checked;
        
        // Apply theme - ensure it takes effect immediately
        document.body.setAttribute('data-theme', theme.toLowerCase());
        console.log('Applied theme:', theme.toLowerCase());
        
        // Apply font size
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${fontSize.toLowerCase()}`);
        
        // Apply compact mode
        if (compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
        
        // Force a small repaint to ensure theme changes are applied
        document.body.style.display = 'none';
        setTimeout(() => {
            document.body.style.display = '';
        }, 5);
    }
    
    // Show toast notification
    function showToast(message) {
        // Check if toast container exists, create if not
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove toast after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Function to update system name preview
    function updateSystemNamePreview() {
        const systemNameInput = document.querySelector('#general input[type="text"]');
        if (!systemNameInput) return;
        
        const systemName = systemNameInput.value || 'Chicken Jockey Coordination System';
        
        // Create or update the preview element
        let previewElement = document.querySelector('.system-name-preview');
        if (!previewElement) {
            previewElement = document.createElement('div');
            previewElement.className = 'system-name-preview';
            systemNameInput.parentNode.appendChild(previewElement);
        }
        
        // Generate abbreviation
        const abbreviation = generateAbbreviation(systemName);
        
        // Update preview
        previewElement.innerHTML = `
            <div class="preview-label">Preview:</div>
            <div class="preview-content">
                <div class="preview-logo">${abbreviation}</div>
                <div class="preview-title">${systemName.toUpperCase()}</div>
            </div>
        `;
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
    
    // Apply system name changes to the entire application
    function applySystemNameChanges(systemName) {
        // Update logo abbreviation if needed
        const logoElement = document.querySelector('.logo');
        if (logoElement) {
            const abbreviation = generateAbbreviation(systemName);
            logoElement.textContent = abbreviation;
        }
        
        // Update document title
        if (systemName) {
            document.title = `Settings - ${systemName}`;
        }
    }
}); 