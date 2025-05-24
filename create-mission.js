// Create Mission Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const createMissionForm = document.getElementById('create-mission-form');
    const missionNameInput = document.getElementById('mission-name');
    const missionTypeSelect = document.getElementById('mission-type');
    const startDateInput = document.getElementById('start-date');
    const startTimeInput = document.getElementById('start-time');
    const endDateInput = document.getElementById('end-date');
    const endTimeInput = document.getElementById('end-time');
    const descriptionTextarea = document.getElementById('description');
    const unitListContainer = document.querySelector('.unit-list');
    const cancelButton = document.getElementById('cancel-mission');
    const saveButton = document.getElementById('save-mission');
    const clearRouteButton = document.getElementById('clear-route');
    const routeMap = document.getElementById('route-map');
    const routePoints = document.getElementById('route-points');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');

    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    startDateInput.value = formatDate(today);
    endDateInput.value = formatDate(tomorrow);
    
    // Set default times
    startTimeInput.value = '09:00';
    endTimeInput.value = '17:00';

    // Populate unit list from localStorage
    populateUnitList();

    // Route map functionality
    let routePointsArray = [];
    
    const addRoutePoint = (e) => {
        const mapRect = routeMap.getBoundingClientRect();
        const x = ((e.clientX - mapRect.left) / mapRect.width) * 100;
        const y = ((e.clientY - mapRect.top) / mapRect.height) * 100;
        
        // Create point element
        const pointElement = document.createElement('div');
        pointElement.className = 'route-point';
        pointElement.style.left = `${x}%`;
        pointElement.style.top = `${y}%`;
        
        // Add point number
        const pointNumber = routePointsArray.length + 1;
        pointElement.setAttribute('data-point', pointNumber);
        pointElement.textContent = pointNumber; // Show point number
        
        // Store point data
        const pointData = { x, y, element: pointElement };
        routePointsArray.push(pointData);
        
        // Add to DOM
        routePoints.appendChild(pointElement);
        
        // Draw line between points if we have more than one point
        if (routePointsArray.length > 1) {
            const prevPoint = routePointsArray[routePointsArray.length - 2];
            drawLineBetweenPoints(prevPoint, pointData);
        }
    };
    
    const drawLineBetweenPoints = (point1, point2) => {
        // Get coordinates
        const x1 = point1.x;
        const y1 = point1.y;
        const x2 = point2.x;
        const y2 = point2.y;
        
        // Calculate distance using the Pythagorean theorem
        // Subtract the radius of the dots (11px as percentage of container width)
        // to ensure the line doesn't extend beyond the dots
        const dotRadiusPercent = 11 / routeMap.offsetWidth * 100;
        
        // Calculate angle in radians
        const angleRad = Math.atan2(y2 - y1, x2 - x1);
        // Calculate angle in degrees for the CSS rotation
        const angleDeg = angleRad * (180 / Math.PI);
        
        // Calculate total distance between centers
        const totalDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        // Calculate the shortened distance to account for the dot radii
        const shortenedDistance = totalDistance - (dotRadiusPercent * 2);
        
        // Calculate the starting point offset to begin at the edge of the first dot
        const startX = x1 + Math.cos(angleRad) * dotRadiusPercent;
        const startY = y1 + Math.sin(angleRad) * dotRadiusPercent;
        
        // Create line element
        const lineElement = document.createElement('div');
        lineElement.className = 'route-line';
        
        // Set the line's width to the shortened distance
        lineElement.style.width = `${shortenedDistance}%`;
        
        // Position the line at the edge of the first dot
        lineElement.style.left = `${startX}%`;
        lineElement.style.top = `${startY}%`;
        
        // Set transform origin to ensure rotation happens at the starting point
        lineElement.style.transformOrigin = '0 50%';
        
        // Rotate the line to point to the second dot
        lineElement.style.transform = `rotate(${angleDeg}deg)`;
        
        // Add line to DOM before points to ensure points appear on top
        routePoints.insertBefore(lineElement, routePoints.firstChild);
    };
    
    const clearRoute = () => {
        // Clear the container
        routePoints.innerHTML = '';
        
        // Reset the array
        routePointsArray = [];
    };
    
    // Event listeners for route map
    routeMap.addEventListener('click', addRoutePoint);
    clearRouteButton.addEventListener('click', clearRoute);

    // Form validation and submission
    const validateForm = () => {
        // Basic validation - check required fields
        if (!missionNameInput.value.trim()) {
            showNotification('Please enter a mission name');
            missionNameInput.focus();
            return false;
        }
        
        if (!missionTypeSelect.value) {
            showNotification('Please select a mission type');
            missionTypeSelect.focus();
            return false;
        }
        
        if (!startDateInput.value || !startTimeInput.value) {
            showNotification('Please set a start date and time');
            return false;
        }
        
        if (!endDateInput.value || !endTimeInput.value) {
            showNotification('Please set an end date and time');
            return false;
        }
        
        // Check if at least one unit is selected
        const selectedUnits = Array.from(document.querySelectorAll('input[name="units"]:checked')).filter(checkbox => checkbox.checked);
        if (selectedUnits.length === 0) {
            showNotification('Please select at least one unit');
            return false;
        }
        
        // Check if start date/time is before end date/time
        const startDateTime = new Date(`${startDateInput.value}T${startTimeInput.value}`);
        const endDateTime = new Date(`${endDateInput.value}T${endTimeInput.value}`);
        
        if (startDateTime >= endDateTime) {
            showNotification('End date/time must be after start date/time');
            return false;
        }
        
        return true;
    };
    
    const showNotification = (message) => {
        notificationMessage.textContent = message;
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };
    
    // Save mission to localStorage
    const saveMission = (missionData) => {
        // Get existing missions or initialize empty array
        const existingMissions = JSON.parse(localStorage.getItem('missions')) || [];
        
        // Format the data to be compatible with the calendar view
        const formattedMission = {
            name: missionData.name,
            date: missionData.startDateTime.split('T')[0], // Extract just the date part
            startTime: missionData.startDateTime.split('T')[1],
            endTime: missionData.endDateTime.split('T')[1],
            units: missionData.units,
            status: missionData.status,
            type: missionData.type, // Explicitly set the mission type
            routePoints: missionData.routePoints || []
        };
        
        // Add the new mission
        existingMissions.push(formattedMission);
        
        // Save back to localStorage
        localStorage.setItem('missions', JSON.stringify(existingMissions));
    };
    
    // Form submission
    createMissionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Collect form data
        const formData = {
            name: missionNameInput.value.trim(),
            type: missionTypeSelect.value,
            startDateTime: `${startDateInput.value}T${startTimeInput.value}`,
            endDateTime: `${endDateInput.value}T${endTimeInput.value}`,
            description: descriptionTextarea.value.trim(),
            units: Array.from(document.querySelectorAll('input[name="units"]:checked'))
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value),
            routePoints: routePointsArray.map(point => ({ x: point.x, y: point.y })),
            status: 'ACTIVE', // Default status for new missions
            dateCreated: new Date().toISOString()
        };
        
        // Save to localStorage
        saveMission(formData);
        
        // Show success message
        showNotification('Mission created successfully!');
        
        // Redirect back to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    });
    
    // Cancel button
    cancelButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            window.location.href = 'dashboard.html';
        }
    });

    // Add visual feedback for form inputs
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // Function to populate unit list from localStorage
    function populateUnitList() {
        // Clear existing unit items
        unitListContainer.innerHTML = '';
        
        // Get units from localStorage
        const units = JSON.parse(localStorage.getItem('units')) || [];
        
        if (units.length === 0) {
            // If no units, show a message
            unitListContainer.innerHTML = '<div class="empty-message">No units available. Please add units first.</div>';
            return;
        }
        
        // Add each unit as a checkbox
        units.forEach((unit, index) => {
            const unitItem = document.createElement('div');
            unitItem.className = 'unit-item';
            
            // The value follows the pattern 'unit1', 'unit2', etc. to maintain compatibility
            const unitValue = `unit${index + 1}`;
            
            unitItem.innerHTML = `
                <input type="checkbox" id="unit-${index + 1}" name="units" value="${unitValue}">
                <label for="unit-${index + 1}">${unit.name} (${unit.id})</label>
            `;
            
            unitListContainer.appendChild(unitItem);
        });
    }
}); 