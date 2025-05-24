// Dashboard Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sample mission data if none exists
    initializeSampleMissions();

    // Initialize archived missions if none exists
    initializeArchivedMissions();
    
    // Initialize sample unit data if none exists
    initializeSampleUnits();

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Initialize calendar if mission calendar tab is active
            if (tabId === 'mission-calendar') {
                // Force refresh of calendar data
                sessionStorage.removeItem('calendarDisplayDate');
                initializeCalendar();
            } else if (tabId === 'mission-archives') {
                loadArchivedMissions();
            } else if (tabId === 'resolve-conflicts') {
                // Populate conflict resolution tab when it's selected
                populateConflictResolutionTab();
            }
        });
    });

    // Add tracking sidebar button functionality
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(button => {
    button.addEventListener('click', () => {
    const target = button.dataset.target;
    if (target) window.location.href = target;   // or window.open(target, '_blank');
    });
    });

    // Load and display missions from localStorage
    loadMissions();
    
    // Check for conflicts
    checkMissionConflicts();

    // Handle mission filtering
    const filterDropdown = document.getElementById('filter-dropdown');
    filterDropdown.addEventListener('change', () => {
        filterMissions(filterDropdown.value);
    });

    // Handle mission sorting
    const sortDropdown = document.getElementById('sort-dropdown');
    sortDropdown.addEventListener('change', () => {
        sortMissions(sortDropdown.value);
    });

    // Handle "Create Mission" button click
    const createMissionBtn = document.querySelector('.btn-create');
    createMissionBtn.addEventListener('click', () => {
        window.location.href = 'create-mission.html';
    });
    
    // Handle conflict resolution form events
    initConflictResolutionForm();
    
    // Initialize Calendar
    initializeCalendar();
    
    // Mission calendar slide panel events
    initializeCalendarPanel();

    // Link from login page
    // Check if coming from login page and show an animation
    if (document.referrer.includes('login.html')) {
        document.body.classList.add('from-login');
    }

    // Initialize mission edit modal
    initMissionEditModal();
});

// Initialize sample mission data if none exists
function initializeSampleMissions() {
    let missions = JSON.parse(localStorage.getItem('missions')) || [];
    
    // Only add sample data if no missions exist
    if (missions.length === 0) {
        // Get current date for displayed month
        const currentDate = new Date();
        
        // Use current year and month, or can be set to match the calendar view (May 2025)
        const year = 2025; // Using the year from the displayed calendar
        const month = 4;   // 0-based index, so 4 = May
        
        // Generate dates for this month
        const sampleMissions = [
            {
                name: 'Woodland Reconnaissance',
                date: new Date(year, month, 5).toISOString().split('T')[0],
                startTime: '08:00',
                endTime: '12:00',
                units: ['unit1', 'unit3'],
                status: 'ACTIVE',
                routePoints: [
                    { x: 20, y: 30 },
                    { x: 35, y: 45 },
                    { x: 50, y: 40 }
                ]
            },
            {
                name: 'Mountain Patrol',
                date: new Date(year, month, 8).toISOString().split('T')[0],
                startTime: '09:00',
                endTime: '14:00',
                units: ['unit2', 'unit5'],
                status: 'ACTIVE',
                routePoints: [
                    { x: 60, y: 20 },
                    { x: 75, y: 30 },
                    { x: 80, y: 50 }
                ]
            },
            {
                name: 'Desert Exploration',
                date: new Date(year, month, 12).toISOString().split('T')[0],
                startTime: '07:30',
                endTime: '11:30',
                units: ['unit4'],
                status: 'PENDING',
                routePoints: [
                    { x: 30, y: 60 },
                    { x: 45, y: 70 },
                    { x: 60, y: 65 }
                ]
            },
        
            
            {
                name: 'Swamp Surveillance',
                date: new Date(year, month, 23).toISOString().split('T')[0],
                startTime: '06:00',
                endTime: '14:00',
                units: ['unit1', 'unit6'],
                status: 'ACTIVE',
                routePoints: [
                    { x: 35, y: 15 },
                    { x: 45, y: 25 },
                    { x: 55, y: 20 }
                ]
            },
            {
                name: 'Cave Investigation',
                date: new Date(year, month, 27).toISOString().split('T')[0],
                startTime: '10:00',
                endTime: '15:00',
                units: ['unit3', 'unit5'],
                status: 'COMPLETED',
                routePoints: [
                    { x: 75, y: 65 },
                    { x: 85, y: 75 },
                    { x: 90, y: 85 }
                ]
            },
            {
                name: 'Night Reconnaissance',
                date: new Date(year, month, 9).toISOString().split('T')[0],
                startTime: '22:00',
                endTime: '02:00',
                units: ['unit2', 'unit4'],
                status: 'ACTIVE',
                routePoints: [
                    { x: 30, y: 40 },
                    { x: 45, y: 50 },
                    { x: 60, y: 45 }
                ]
            }
        ];
        
        // Save to localStorage
        localStorage.setItem('missions', JSON.stringify(sampleMissions));
    }
}

// Initialize archived missions array if none exists
function initializeArchivedMissions() {
    if (!localStorage.getItem('archivedMissions')) {
        localStorage.setItem('archivedMissions', JSON.stringify([]));
    }
}

// Load archived missions from localStorage
function loadArchivedMissions() {
    const archivesTab = document.getElementById('mission-archives');
    if (!archivesTab) return;
    
    // Clear existing content
    archivesTab.innerHTML = '';
    
    // Get archived missions from localStorage
    const archivedMissions = JSON.parse(localStorage.getItem('archivedMissions')) || [];
    
    if (archivedMissions.length === 0) {
        // Show placeholder if no archived missions
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-content';
        placeholder.innerHTML = `
            <h3>Mission Archives</h3>
            <p>No archived missions available.</p>
        `;
        archivesTab.appendChild(placeholder);
        return;
    }
    
    // Get units from localStorage to map unit IDs to names
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    
    // Create table
    const table = document.createElement('table');
    table.className = 'mission-table';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Mission ID</th>
            <th>Name</th>
            <th>Date</th>
            <th>Units</th>
            <th>Status</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Add archived missions to table
    archivedMissions.forEach((mission, index) => {
        const missionId = `#A${1000 + index}`;
        const row = document.createElement('tr');
        
        // Format date for display
        let dateDisplay = 'N/A';
        if (mission.date) {
            const dateObj = new Date(mission.date);
            dateDisplay = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
        }
        
        // Convert unit references (unit1, unit2, etc.) to actual unit names
        let unitsText = '';
        if (mission.units && mission.units.length > 0) {
            const unitNames = mission.units.map(unitRef => {
                // Extract the unit index from unitX format (e.g., "unit1" -> 0)
                const unitIndex = parseInt(unitRef.replace('unit', ''), 10) - 1;
                // Get the actual unit name if it exists
                return unitIndex >= 0 && unitIndex < units.length 
                    ? units[unitIndex].name 
                    : unitRef; // Fallback to the original reference
            });
            unitsText = unitNames.join(', ');
        } else {
            unitsText = 'None';
        }
        
        const status = mission.status || 'ARCHIVED';
        
        row.innerHTML = `
            <td>${missionId}</td>
            <td>${mission.name}</td>
            <td>${dateDisplay}</td>
            <td>${unitsText}</td>
            <td><span class="status-completed">${status}</span></td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    archivesTab.appendChild(tableContainer);
}

// Load missions from localStorage
function loadMissions() {
    const missionTableBody = document.getElementById('mission-table-body');
    if (!missionTableBody) return;
    
    // Clear existing rows
    missionTableBody.innerHTML = '';
    
    // Get missions from localStorage
    let missions = JSON.parse(localStorage.getItem('missions')) || [];
    
    if (missions.length === 0) {
        // Add empty state message if no missions
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-state';
        emptyRow.innerHTML = `
            <td colspan="5" class="empty-message">
                No missions available. Click "CREATE MISSION" to add one.
            </td>
        `;
        missionTableBody.appendChild(emptyRow);
        return;
    }
    
    // Get units from localStorage to map unit IDs to names
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Add missions to table
    missions.forEach((mission, index) => {
        const missionId = `#${1138 + index}`;
        const row = document.createElement('tr');
        row.setAttribute('data-mission-id', missionId);
        
        // If this mission has route points, store them as a data attribute
        if (mission.routePoints && mission.routePoints.length > 0) {
            row.setAttribute('data-route', JSON.stringify(mission.routePoints));
        }
        
        // Convert unit references (unit1, unit2, etc.) to actual unit names
        let unitsText = '';
        if (mission.units && mission.units.length > 0) {
            const unitNames = mission.units.map(unitRef => {
                // Extract the unit index from unitX format (e.g., "unit1" -> 0)
                const unitIndex = parseInt(unitRef.replace('unit', ''), 10) - 1;
                // Get the actual unit name if it exists
                return unitIndex >= 0 && unitIndex < units.length 
                    ? units[unitIndex].name 
                    : unitRef; // Fallback to the original reference
            });
            unitsText = unitNames.join(', ');
        } else {
            unitsText = 'None';
        }
            
        const status = mission.status || 'ACTIVE'; // Default to ACTIVE if not specified
        
        row.innerHTML = `
            <td>${missionId}</td>
            <td>${mission.name}</td>
            <td>${unitsText}</td>
            <td><span class="status-${status.toLowerCase()}">${status}</span></td>
            <td class="actions-cell">
                <button class="btn-action">View/Edit</button>
                <button class="btn-track" data-mission-id="${index}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </td>
        `;
        
        missionTableBody.appendChild(row);
    });
    
    // Attach action button event listeners
    attachActionButtonListeners();
    
    // Attach tracking button event listeners
    attachTrackingButtonListeners();
}

// Initialize Mission Calendar
function initializeCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    if (!calendarDays) return;
    
    // Get current display date from sessionStorage or use default
    let displayDate;
    const storedDate = sessionStorage.getItem('calendarDisplayDate');
    if (storedDate) {
        displayDate = new Date(storedDate);
    } else {
        // Default to current month
        const today = new Date();
        displayDate = new Date(today.getFullYear(), today.getMonth(), 1);
        sessionStorage.setItem('calendarDisplayDate', displayDate.toISOString());
    }
    
    const currentMonth = displayDate.getMonth();
    const currentYear = displayDate.getFullYear();
    
    // Clear existing calendar days
    calendarDays.innerHTML = '';
    
    // Update month title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthElement = document.querySelector('.current-month');
    if (currentMonthElement) {
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Create calendar grid
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Get missions from localStorage
    const missions = JSON.parse(localStorage.getItem('missions')) || [];
    
    // Create map of missions by date
    const missionsByDate = {};
    missions.forEach((mission, index) => {
        if (!mission.date) return;
        
        const missionDate = new Date(mission.date);
        
        // Skip if not in displayed month
        if (missionDate.getMonth() !== currentMonth || missionDate.getFullYear() !== currentYear) {
            return;
        }
        
        const dateKey = missionDate.getDate();
        
        if (!missionsByDate[dateKey]) {
            missionsByDate[dateKey] = [];
        }
        
        // Determine mission type based on name and explicit type if available
        let missionType = mission.type || 'reconnaissance'; // Use explicit type if available
        
        // If no explicit type, try to determine from name
        if (!mission.type && mission.name) {
            const name = mission.name.toLowerCase();
            if (name.includes('patrol') || name.includes('combat')) {
                missionType = 'patrol';
            } else if (name.includes('exploration')) {
                missionType = 'exploration';
            } else if (name.includes('surveillance')) {
                missionType = 'surveillance';
            } else if (name.includes('investigation')) {
                missionType = 'investigation';
            } else if (name.includes('recon') || name.includes('reconnaissance')) {
                missionType = 'reconnaissance';
            } else if (name.includes('supply') || name.includes('resource')) {
                missionType = 'supply';
            } else if (name.includes('training') || name.includes('admin')) {
                missionType = 'training';
            }
        }
        
        missionsByDate[dateKey].push({
            id: `#${1138 + index}`,
            name: mission.name,
            type: missionType,
            status: mission.status,
            startTime: mission.startTime || '09:00',
            endTime: mission.endTime || '12:00',
            units: mission.units || []
        });
    });
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = day;
        
        // Highlight current day
        const today = new Date();
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayElement.classList.add('current-day');
        }
        
        // Add mission names if there are missions on this day
        if (missionsByDate[day]) {
            const missions = missionsByDate[day];
            
            // Store mission data for this date
            dayElement.setAttribute('data-missions', JSON.stringify(missions));
            
            // Create container for mission names
            const namesContainer = document.createElement('div');
            namesContainer.className = 'mission-names-container';
            
            // Show up to 3 missions per day (to avoid overcrowding)
            missions.slice(0, 3).forEach(mission => {
                const missionNameElement = document.createElement('div');
                missionNameElement.className = 'mission-name';
                
                // Add status dot
                const statusDot = document.createElement('span');
                statusDot.className = `mission-dot ${mission.status.toLowerCase()}`;
                missionNameElement.appendChild(statusDot);
                
                // Add mission type indicator
                const typeIndicator = document.createElement('span');
                typeIndicator.className = `mission-type-indicator ${mission.type.toLowerCase()}`;
                typeIndicator.style.marginRight = '4px';
                missionNameElement.appendChild(typeIndicator);
                
                // Add mission name text
                const nameText = document.createTextNode(mission.name.length > 10 ? mission.name.substring(0, 10) + '...' : mission.name);
                missionNameElement.appendChild(nameText);
                
                // Add click event to show mission details
                missionNameElement.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent day click event
                    showMissionsForDate(day, [mission], currentMonth, currentYear);
                });
                
                namesContainer.appendChild(missionNameElement);
            });
            
            // If there are more missions than we're showing, add indicator
            if (missions.length > 3) {
                const moreIndicator = document.createElement('div');
                moreIndicator.className = 'mission-name';
                moreIndicator.textContent = `+${missions.length - 3} more`;
                moreIndicator.style.fontSize = '8px';
                moreIndicator.style.textAlign = 'right';
                namesContainer.appendChild(moreIndicator);
            }
            
            dayElement.appendChild(namesContainer);
            
            // Add click event to show all missions for this day
            dayElement.addEventListener('click', () => {
                showMissionsForDate(day, missionsByDate[day], currentMonth, currentYear);
            });
        }
        
        calendarDays.appendChild(dayElement);
    }
    
    // Add navigation event listeners
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            // Navigate to previous month
            const newDate = new Date(currentYear, currentMonth - 1, 1);
            sessionStorage.setItem('calendarDisplayDate', newDate.toISOString());
            initializeCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            // Navigate to next month
            const newDate = new Date(currentYear, currentMonth + 1, 1);
            sessionStorage.setItem('calendarDisplayDate', newDate.toISOString());
            initializeCalendar();
        });
    }
}

// Initialize calendar slide panel functionality
function initializeCalendarPanel() {
    const panel = document.getElementById('mission-details-panel');
    const closeBtn = document.querySelector('.close-panel');
    const calendarContainer = document.querySelector('.calendar-container');
    
    if (!panel || !closeBtn) return;
    
    // Close panel when close button is clicked
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        calendarContainer.classList.remove('panel-open');
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (panel.classList.contains('open') && 
            !panel.contains(e.target) && 
            !e.target.classList.contains('day') &&
            !e.target.classList.contains('mission-dot')) {
            panel.classList.remove('open');
            calendarContainer.classList.remove('panel-open');
        }
    });
}

// Show missions for a specific date in the slide panel
function showMissionsForDate(day, missions, currentMonth, currentYear) {
    const panel = document.getElementById('mission-details-panel');
    const dateTitle = document.getElementById('panel-date-title');
    const missionsList = document.getElementById('date-missions-list');
    const calendarContainer = document.querySelector('.calendar-container');
    
    if (!panel || !dateTitle || !missionsList) return;
    
    // Format the date
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    dateTitle.textContent = `Missions on ${monthNames[currentMonth]} ${day}, ${currentYear}`;
    
    // Clear existing missions
    missionsList.innerHTML = '';
    
    // Get units from localStorage to map unit IDs to names
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Add missions to the list
    if (missions && missions.length > 0) {
        // Create missions table
        const table = document.createElement('table');
        table.className = 'missions-table';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Time</th>
                <th>Units</th>
                <th>Actions</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Add mission rows
        missions.forEach(mission => {
            const row = document.createElement('tr');
            row.className = `mission-row ${mission.type}`;
            
            // Convert unit references (unit1, unit2, etc.) to actual unit names
            let unitsText = '';
            if (mission.units && mission.units.length > 0) {
                const unitNames = mission.units.map(unitRef => {
                    // Extract the unit index from unitX format (e.g., "unit1" -> 0)
                    const unitIndex = parseInt(unitRef.replace('unit', ''), 10) - 1;
                    // Get the actual unit name if it exists
                    return unitIndex >= 0 && unitIndex < units.length 
                        ? units[unitIndex].name 
                        : unitRef; // Fallback to the original reference
                });
                unitsText = unitNames.join(', ');
            } else {
                unitsText = 'None';
            }
            
            row.innerHTML = `
                <td>${mission.name}</td>
                <td>${mission.startTime} - ${mission.endTime}</td>
                <td>${unitsText}</td>
                <td>
                    <button class="view-mission" data-id="${mission.id}">View</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        missionsList.appendChild(table);
        
        // Add event listeners to view buttons
        const viewButtons = missionsList.querySelectorAll('.view-mission');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const missionId = button.getAttribute('data-id');
                showMissionDetails(missionId, missions);
            });
        });
    } else {
        // Show no missions message
        const noMissions = document.createElement('div');
        noMissions.className = 'no-missions';
        noMissions.textContent = 'No missions scheduled for this date.';
        missionsList.appendChild(noMissions);
    }
    
    // Open the panel with smooth transition
    panel.classList.add('open');
    calendarContainer.classList.add('panel-open');
}

// Function to show detailed info for a specific mission
function showMissionDetails(missionId, missions) {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;
    
    // Get the panel content
    const missionsList = document.getElementById('date-missions-list');
    if (!missionsList) return;
    
    // Save current content
    const originalContent = missionsList.innerHTML;
    
    // Get units from localStorage to map unit IDs to names
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Convert unit references (unit1, unit2, etc.) to actual unit names
    let unitsText = '';
    if (mission.units && mission.units.length > 0) {
        const unitNames = mission.units.map(unitRef => {
            // Extract the unit index from unitX format (e.g., "unit1" -> 0)
            const unitIndex = parseInt(unitRef.replace('unit', ''), 10) - 1;
            // Get the actual unit name if it exists
            return unitIndex >= 0 && unitIndex < units.length 
                ? units[unitIndex].name 
                : unitRef; // Fallback to the original reference
        });
        unitsText = unitNames.join(', ');
    } else {
        unitsText = 'None';
    }
    
    // Create detailed view
    const details = document.createElement('div');
    details.className = 'mission-details';
    
    // Create the details HTML
    details.innerHTML = `
        <h3 class="mission-detail-title">${mission.name}</h3>
        <div class="mission-id">${mission.id}</div>
        
        <div class="detail-section">
            <div class="detail-row"><span class="detail-label">Time:</span> ${mission.startTime} - ${mission.endTime}</div>
            <div class="detail-row"><span class="detail-label">Units:</span> ${unitsText}</div>
            <div class="detail-row">
                <span class="detail-label">Type:</span> 
                <span class="mission-type-indicator ${mission.type}"></span>
                ${mission.type.charAt(0).toUpperCase() + mission.type.slice(1)}
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="mission-dot ${mission.status.toLowerCase()}"></span>
                ${mission.status}
            </div>
        </div>
        
        <div class="form-actions" style="margin-top: 20px; display: flex; gap: 10px;">
            <button class="btn-edit-mission">Edit Mission</button>
        <button class="btn-back">Back to Missions List</button>
        </div>
    `;
    
    // Clear and replace content
    missionsList.innerHTML = '';
    missionsList.appendChild(details);
    
    // Add back button event listener
    const backButton = missionsList.querySelector('.btn-back');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // Restore original content
            missionsList.innerHTML = originalContent;
            
            // Re-attach view button event listeners
            const viewButtons = missionsList.querySelectorAll('.view-mission');
            viewButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    showMissionDetails(id, missions);
                });
            });
        });
    }
    
    // Add edit button event listener
    const editButton = missionsList.querySelector('.btn-edit-mission');
    if (editButton) {
        editButton.addEventListener('click', () => {
            // Extract mission index from ID (format: #1138)
            const missionIndex = parseInt(mission.id.replace('#', '')) - 1138;
            openMissionEditModal(missionIndex);
        });
    }
}

// Check for mission conflicts
function checkMissionConflicts() {
    const missions = JSON.parse(localStorage.getItem('missions')) || [];
    const conflicts = [];
    
    // Find missions with the same units assigned and overlapping time
    for (let i = 0; i < missions.length; i++) {
        const mission1 = missions[i];
        if (!mission1.units || mission1.units.length === 0) continue;
        
        for (let j = i + 1; j < missions.length; j++) {
            const mission2 = missions[j];
            if (!mission2.units || mission2.units.length === 0) continue;
            
            // Check for overlapping units
            const overlappingUnits = mission1.units.filter(unit => mission2.units.includes(unit));
            
            if (overlappingUnits.length > 0) {
                // Check if the missions have overlapping time
                const timeOverlap = checkTimeOverlap(mission1, mission2);
                
                if (timeOverlap) {
                conflicts.push({
                    mission1Index: i,
                    mission2Index: j,
                    mission1: mission1,
                    mission2: mission2,
                        overlappingUnits: overlappingUnits,
                        timeOverlap: timeOverlap
                });
                }
            }
        }
    }
    
    // Update the conflict counter badge
    const conflictCounter = document.getElementById('conflict-counter');
    if (conflictCounter) {
        conflictCounter.textContent = conflicts.length.toString();
        
        // Store conflicts in sessionStorage for use in the conflict resolution tab
        sessionStorage.setItem('missionConflicts', JSON.stringify(conflicts));
        
        // If we're on the conflicts tab, update the display
        const conflictsTab = document.getElementById('resolve-conflicts');
        if (conflictsTab && conflictsTab.classList.contains('active')) {
            populateConflictResolutionTab();
        }
    }
    
    return conflicts;
}

// Helper function to check if two missions have overlapping time
function checkTimeOverlap(mission1, mission2) {
    // If missions are on different dates, no overlap
    if (mission1.date !== mission2.date) {
        return false;
    }
    
    // Parse mission times to 24-hour format for comparison
    const start1 = parseTimeToMinutes(mission1.startTime);
    const end1 = parseTimeToMinutes(mission1.endTime);
    const start2 = parseTimeToMinutes(mission2.startTime);
    const end2 = parseTimeToMinutes(mission2.endTime);
    
    // Check for time overlap
    // Missions overlap if one starts before the other ends
    const overlap = (start1 < end2) && (start2 < end1);
    
    if (overlap) {
        return {
            date: mission1.date,
            timeRanges: [
                { start: mission1.startTime, end: mission1.endTime },
                { start: mission2.startTime, end: mission2.endTime }
            ]
        };
    }
    
    return false;
}

// Helper function to parse time string to minutes since midnight for easy comparison
function parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Function to populate the conflict resolution tab with actual conflict data
function populateConflictResolutionTab() {
    const conflictPanel = document.querySelector('.conflict-panel');
    if (!conflictPanel) return;
    
    // Clear previous content except the heading
    const heading = conflictPanel.querySelector('h3');
    conflictPanel.innerHTML = '';
    if (heading) {
        conflictPanel.appendChild(heading);
    } else {
        const newHeading = document.createElement('h3');
        newHeading.textContent = 'Resolve Mission Conflicts';
        conflictPanel.appendChild(newHeading);
    }
    
    // Get conflicts from sessionStorage
    const conflicts = JSON.parse(sessionStorage.getItem('missionConflicts')) || [];
    
    // Get units from localStorage to display proper names
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // If no conflicts, show a message
    if (conflicts.length === 0) {
        const noConflictsMsg = document.createElement('div');
        noConflictsMsg.className = 'empty-message';
        noConflictsMsg.textContent = 'No conflicts detected between missions.';
        conflictPanel.appendChild(noConflictsMsg);
        return;
    }
    
    // Function to get unit name from unit ID
    function getUnitName(unitId) {
        const unitIndex = parseInt(unitId.replace('unit', '')) - 1;
        if (units[unitIndex]) {
            return units[unitIndex].name;
        }
        return unitId; // Fallback to ID if name not found
    }
    
    // Add each conflict as a card
    conflicts.forEach((conflict, index) => {
        const { mission1, mission2, overlappingUnits, timeOverlap } = conflict;
        
        // Create a conflict header with conflict number
        const conflictHeader = document.createElement('div');
        conflictHeader.className = 'conflict-header';
        conflictHeader.innerHTML = `<h3 class="conflict-number clickable" data-conflict-index="${index}">Conflict #${index + 1}</h3>`;
        
        // Add click handler to the conflict number
        conflictHeader.querySelector('.conflict-number').addEventListener('click', () => {
            selectConflictForResolution(index);
        });
        
        conflictPanel.appendChild(conflictHeader);
        
        // Create conflict card for mission 1
        const card1 = document.createElement('div');
        card1.className = 'mission-conflict-card';
        card1.setAttribute('data-conflict-index', index);
        card1.setAttribute('data-mission-index', conflict.mission1Index);
        
        // Format dates for display
        const date1 = new Date(mission1.date);
        const formattedDate1 = `${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getDate().toString().padStart(2, '0')}/${date1.getFullYear()}`;
        
        // Format unit names with proper highlighting for conflicting units
        const unitsList1 = mission1.units.map(unit => {
            if (overlappingUnits.includes(unit)) {
                return `<strong>${getUnitName(unit)}</strong>`;
            }
            return getUnitName(unit);
        }).join(', ');
        
        // Add time conflict highlight if applicable
        let timeSection = `<div class="info-row"><span>Time:</span> ${formatTimeWithAMPM(mission1.startTime)} - ${formatTimeWithAMPM(mission1.endTime)}</div>`;
        if (timeOverlap) {
            timeSection = `<div class="info-row conflict-highlight"><span>Time:</span> <strong>${formatTimeWithAMPM(mission1.startTime)} - ${formatTimeWithAMPM(mission1.endTime)}</strong></div>`;
        }
        
        card1.innerHTML = `
            <div class="mission-info">
                <h4>Mission 1</h4>
                <div class="info-row"><span>ID:</span> #${1138 + conflict.mission1Index}</div>
                <div class="info-row"><span>Name:</span> ${mission1.name}</div>
                <div class="info-row"><span>Date:</span> ${formattedDate1}</div>
                ${timeSection}
                <div class="info-row conflict-highlight"><span>Units:</span> ${unitsList1}</div>
            </div>
            
            <div class="conflict-warning">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 2L1 21h22L12 2zm0 16h-2v2h2v-2zm0-7h-2v5h2v-5z" fill="currentColor"/>
                </svg>
                <span>CONFLICT</span>
            </div>
        `;
        
        // Create conflict card for mission 2
        const card2 = document.createElement('div');
        card2.className = 'mission-conflict-card';
        card2.setAttribute('data-conflict-index', index);
        card2.setAttribute('data-mission-index', conflict.mission2Index);
        
        // Format dates for display
        const date2 = new Date(mission2.date);
        const formattedDate2 = `${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getDate().toString().padStart(2, '0')}/${date2.getFullYear()}`;
        
        // Format unit names with proper highlighting for conflicting units
        const unitsList2 = mission2.units.map(unit => {
            if (overlappingUnits.includes(unit)) {
                return `<strong>${getUnitName(unit)}</strong>`;
            }
            return getUnitName(unit);
        }).join(', ');
        
        // Add time conflict highlight if applicable
        let timeSection2 = `<div class="info-row"><span>Time:</span> ${formatTimeWithAMPM(mission2.startTime)} - ${formatTimeWithAMPM(mission2.endTime)}</div>`;
        if (timeOverlap) {
            timeSection2 = `<div class="info-row conflict-highlight"><span>Time:</span> <strong>${formatTimeWithAMPM(mission2.startTime)} - ${formatTimeWithAMPM(mission2.endTime)}</strong></div>`;
        }
        
        card2.innerHTML = `
            <div class="mission-info">
                <h4>Mission 2</h4>
                <div class="info-row"><span>ID:</span> #${1138 + conflict.mission2Index}</div>
                <div class="info-row"><span>Name:</span> ${mission2.name}</div>
                <div class="info-row"><span>Date:</span> ${formattedDate2}</div>
                ${timeSection2}
                <div class="info-row conflict-highlight"><span>Units:</span> ${unitsList2}</div>
            </div>
            
            <div class="conflict-warning">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 2L1 21h22L12 2zm0 16h-2v2h2v-2zm0-7h-2v5h2v-5z" fill="currentColor"/>
                </svg>
                <span>CONFLICT</span>
            </div>
        `;
        
        // Add conflict type indicator
        const conflictDescription = document.createElement('div');
        conflictDescription.className = 'conflict-description';
        conflictDescription.innerHTML = `
            <p><strong>Conflict Type:</strong> 
                ${timeOverlap ? 'Time and Unit overlap' : 'Unit assignment only'}
            </p>
            <p><strong>Description:</strong> 
                ${getConflictDescription(conflict)}
            </p>
        `;
        
        // Create mission selection dropdown
        const missionSelectContainer = document.createElement('div');
        missionSelectContainer.className = 'mission-select-container';
        missionSelectContainer.innerHTML = `
            <label for="conflict-${index}-mission-select">Select mission to modify:</label>
            <select id="conflict-${index}-mission-select" class="mission-select" data-conflict-index="${index}">
                <option value="${conflict.mission1Index}">Mission 1: ${mission1.name} (#${1138 + conflict.mission1Index})</option>
                <option value="${conflict.mission2Index}" selected>Mission 2: ${mission2.name} (#${1138 + conflict.mission2Index})</option>
            </select>
        `;
        
        // Add event listener to the mission select dropdown
        missionSelectContainer.querySelector('select').addEventListener('change', function() {
            const selectedMissionIndex = parseInt(this.value);
            const conflictIdx = parseInt(this.getAttribute('data-conflict-index'));
            
            // Update the conflict object in session storage to swap mission1 and mission2 if needed
            const conflicts = JSON.parse(sessionStorage.getItem('missionConflicts')) || [];
            if (conflicts[conflictIdx]) {
                // If the user selected mission1, swap mission1 and mission2 in the conflict
                if (selectedMissionIndex === conflicts[conflictIdx].mission1Index) {
                    const temp = conflicts[conflictIdx].mission1;
                    conflicts[conflictIdx].mission1 = conflicts[conflictIdx].mission2;
                    conflicts[conflictIdx].mission2 = temp;
                    
                    const tempIndex = conflicts[conflictIdx].mission1Index;
                    conflicts[conflictIdx].mission1Index = conflicts[conflictIdx].mission2Index;
                    conflicts[conflictIdx].mission2Index = tempIndex;
                    
                    // Update session storage
                    sessionStorage.setItem('missionConflicts', JSON.stringify(conflicts));
                }
                
                // Update the form with the selected mission
                selectConflictForResolution(conflictIdx);
            }
        });
        
        // Add click handler to select this conflict for resolution
        card1.addEventListener('click', () => selectConflictForResolution(index));
        card2.addEventListener('click', () => selectConflictForResolution(index));
        
        // Append cards to the panel
        conflictPanel.appendChild(card1);
        conflictPanel.appendChild(conflictDescription);
        conflictPanel.appendChild(missionSelectContainer);
        conflictPanel.appendChild(card2);
        
        // Add a separator between conflicts
        if (index < conflicts.length - 1) {
            const separator = document.createElement('hr');
            separator.style.margin = '20px 0';
            separator.style.borderTop = '1px dashed var(--border-color)';
            conflictPanel.appendChild(separator);
        }
    });
    
    // Select the first conflict by default
    selectConflictForResolution(0);
}

// Helper function to generate a human-readable conflict description
function getConflictDescription(conflict) {
    const { mission1, mission2, overlappingUnits, timeOverlap } = conflict;
    
    // Get unit names for display
    const units = JSON.parse(localStorage.getItem('units')) || [];
    const unitNames = overlappingUnits.map(unitId => {
        const unitIndex = parseInt(unitId.replace('unit', '')) - 1;
        return units[unitIndex] ? units[unitIndex].name : unitId;
    });
    
    let description = '';
    
    if (timeOverlap) {
        const date = new Date(timeOverlap.date);
        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
        
        description = `Missions "${mission1.name}" and "${mission2.name}" are scheduled to overlap on ${formattedDate}, and both require the same unit(s): ${unitNames.join(', ')}. Please reschedule one mission or reassign the conflicting units.`;
    } else {
        description = `Units ${unitNames.join(', ')} are assigned to multiple missions. Please reassign units to resolve the conflict.`;
    }
    
    return description;
}

// Function to select a conflict for resolution
function selectConflictForResolution(conflictIndex) {
    // Get conflicts from sessionStorage
    const conflicts = JSON.parse(sessionStorage.getItem('missionConflicts')) || [];
    if (conflicts.length === 0 || conflictIndex >= conflicts.length) return;
    
    const conflict = conflicts[conflictIndex];
    
    // Highlight the selected conflict cards
    const conflictCards = document.querySelectorAll('.mission-conflict-card');
    conflictCards.forEach(card => {
        card.classList.remove('selected');
        card.classList.remove('target-mission');
        if (parseInt(card.getAttribute('data-conflict-index')) === conflictIndex) {
            card.classList.add('selected');
            
            // Add target-mission class to the second mission, which is the one being modified
            if (parseInt(card.getAttribute('data-mission-index')) === conflict.mission2Index) {
                card.classList.add('target-mission');
            }
        }
    });
    
    // Store the selected conflict index in the form
    const resolutionForm = document.getElementById('resolution-form');
    if (resolutionForm) {
        resolutionForm.setAttribute('data-conflict-index', conflictIndex);
    }
    
    // Update the resolution form with the conflict data
    updateResolutionForm(conflict);
}

// Function to update the resolution form with conflict data
function updateResolutionForm(conflict) {
    const resolutionType = document.getElementById('resolution-type');
    const rescheduleOptions = document.getElementById('reschedule-options');
    const reassignOptions = document.getElementById('reassign-options');
    
    if (!resolutionType || !rescheduleOptions || !reassignOptions) return;
    
    // Update the panel heading to include the target mission name
    const resolutionPanelHeading = document.querySelector('.resolution-panel h3');
    if (resolutionPanelHeading && conflict.mission2) {
        resolutionPanelHeading.innerHTML = `Conflict Resolution: <span style="color: var(--conflict-color); font-weight: 700;">${conflict.mission2.name}</span>`;
    }
    
    // Update resolution type label to include mission ID
    const resolutionTypeLabel = document.querySelector('label[for="resolution-type"]');
    if (resolutionTypeLabel && conflict.mission2Index !== undefined) {
        resolutionTypeLabel.innerHTML = `Action for Mission #${1138 + conflict.mission2Index}`;
    }
    
    // Update the selected mission in the dropdown for this conflict
    const conflictIndex = parseInt(document.getElementById('resolution-form').getAttribute('data-conflict-index'));
    const missionSelect = document.getElementById(`conflict-${conflictIndex}-mission-select`);
    if (missionSelect) {
        missionSelect.value = conflict.mission2Index;
    }
    
    // Show/hide options based on selected resolution type
    resolutionType.addEventListener('change', function() {
        if (this.value === 'reschedule') {
            rescheduleOptions.style.display = 'block';
            reassignOptions.style.display = 'none';
        } else if (this.value === 'reassign') {
            rescheduleOptions.style.display = 'none';
            reassignOptions.style.display = 'block';
        } else {
            rescheduleOptions.style.display = 'none';
            reassignOptions.style.display = 'none';
        }
    });
    
    // Set default values for the form
    const newDate = document.getElementById('new-date');
    const newStartTime = document.getElementById('new-start-time');
    const newEndTime = document.getElementById('new-end-time');
    
    if (newDate && newStartTime && newEndTime) {
        // Set date to the current mission date by default
        if (conflict && conflict.mission1) {
            newDate.value = conflict.mission1.date;
        } else {
            // Or set date to tomorrow as a fallback
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            newDate.value = tomorrow.toISOString().split('T')[0];
        }
        
        // Set times from the first mission
        if (conflict && conflict.mission1) {
            newStartTime.value = conflict.mission1.startTime;
            newEndTime.value = conflict.mission1.endTime;
        }
    }
    
    // Update unit checkboxes based on conflicting units
    const unitCheckboxes = document.querySelectorAll('#reassign-options .unit-checkboxes input');
    unitCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        if (conflict && conflict.overlappingUnits && conflict.overlappingUnits.includes(checkbox.value)) {
            checkbox.checked = true;
        }
    });
    
    // Get available units for reassignment
    populateAvailableUnits(conflict);
    
    // If the conflict is a time conflict, suggest rescheduling by default
    if (conflict && conflict.timeOverlap) {
        resolutionType.value = 'reschedule';
        rescheduleOptions.style.display = 'block';
        reassignOptions.style.display = 'none';
        
        // Suggest a new time (end of the conflicting mission)
        if (conflict.mission2) {
            const mission1End = parseTimeToMinutes(conflict.mission1.endTime);
            const mission2End = parseTimeToMinutes(conflict.mission2.endTime);
            
            // Use the later end time as the new start time
            const laterEndTime = Math.max(mission1End, mission2End);
            const newTime = minutesToTimeString(laterEndTime + 30); // Add 30 minutes buffer
            
            newStartTime.value = newTime;
            newEndTime.value = minutesToTimeString(laterEndTime + 30 + 120); // 2 hour mission by default
        }
    } else {
        // Otherwise, suggest reassigning units
        resolutionType.value = 'reassign';
        rescheduleOptions.style.display = 'none';
        reassignOptions.style.display = 'block';
    }
}

// Helper function to convert minutes since midnight to time string "HH:MM"
function minutesToTimeString(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Function to populate available units for reassignment
function populateAvailableUnits(conflict) {
    const newUnitSelect = document.getElementById('new-unit');
    if (!newUnitSelect) return;
    
    // Clear existing options
    newUnitSelect.innerHTML = '';
    
    // Get all units
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Get all missions to check availability
    const missions = JSON.parse(localStorage.getItem('missions')) || [];
    
    // Get the mission conflict date and time range
    let conflictDate = '';
    let conflictTimeRange = { start: 0, end: 0 };
    
    if (conflict && conflict.timeOverlap) {
        conflictDate = conflict.timeOverlap.date;
        
        // Convert time ranges to minutes for comparison
        const start1 = parseTimeToMinutes(conflict.mission1.startTime);
        const end1 = parseTimeToMinutes(conflict.mission1.endTime);
        const start2 = parseTimeToMinutes(conflict.mission2.startTime);
        const end2 = parseTimeToMinutes(conflict.mission2.endTime);
        
        // Get the overlapping time range
        conflictTimeRange.start = Math.max(start1, start2);
        conflictTimeRange.end = Math.min(end1, end2);
    } else if (conflict && conflict.mission1) {
        conflictDate = conflict.mission1.date;
        conflictTimeRange.start = parseTimeToMinutes(conflict.mission1.startTime);
        conflictTimeRange.end = parseTimeToMinutes(conflict.mission1.endTime);
    }
    
    // Determine which units are already busy with other missions at the conflict time
    const busyUnits = new Set();
    
    missions.forEach((mission, index) => {
        // Skip the missions involved in the conflict
        if (conflict && (index === conflict.mission1Index || index === conflict.mission2Index)) {
            return;
        }
        
        // If the mission is on a different date, units are available
        if (mission.date !== conflictDate) {
            return;
        }
        
        // Check if the mission overlaps with the conflict time
        const missionStart = parseTimeToMinutes(mission.startTime);
        const missionEnd = parseTimeToMinutes(mission.endTime);
        
        const overlaps = (missionStart < conflictTimeRange.end) && (conflictTimeRange.start < missionEnd);
        
        if (overlaps && mission.units) {
            // These units are busy with another mission at the conflict time
            mission.units.forEach(unitId => busyUnits.add(unitId));
        }
    });
    
    // Add available units to the dropdown
    units.forEach((unit, index) => {
        // Skip units that are already busy with other missions
        const unitId = `unit${index + 1}`;
        if (busyUnits.has(unitId)) {
            return;
        }
        
        // Also skip units that are part of the conflict
        if (conflict && conflict.overlappingUnits && conflict.overlappingUnits.includes(unitId)) {
            return;
        }
        
        const option = document.createElement('option');
        option.value = unitId;
        option.textContent = `${unit.name} (${unit.id})`;
        newUnitSelect.appendChild(option);
    });
    
    // If no options were added, show a message
    if (newUnitSelect.options.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No available units";
        newUnitSelect.appendChild(option);
    }
}

// Function to populate unit checkboxes in the conflict resolution form
function populateConflictResolutionUnits() {
    const unitCheckboxes = document.querySelector('#reassign-options .unit-checkboxes');
    if (!unitCheckboxes) return;
    
    // Clear existing checkboxes
    unitCheckboxes.innerHTML = '';
    
    // Get units from localStorage
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Add a checkbox for each unit
    units.forEach((unit, index) => {
        const unitId = `unit${index + 1}`;
        
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'unit-checkbox';
        
        checkboxDiv.innerHTML = `
            <input type="checkbox" id="conflict-${unitId}" value="${unitId}">
            <label for="conflict-${unitId}">${unit.name} (${unit.id})</label>
        `;
        
        unitCheckboxes.appendChild(checkboxDiv);
    });
}

// Initialize conflict resolution form event handlers
function initConflictResolutionForm() {
    // Populate unit checkboxes and dropdown
    populateConflictResolutionUnits();
    
    // Resolution type change handler
    const resolutionType = document.getElementById('resolution-type');
    const rescheduleOptions = document.getElementById('reschedule-options');
    const reassignOptions = document.getElementById('reassign-options');
    
    if (resolutionType && rescheduleOptions && reassignOptions) {
        resolutionType.addEventListener('change', function() {
            if (this.value === 'reschedule') {
                rescheduleOptions.style.display = 'block';
                reassignOptions.style.display = 'none';
                
                // Keep button text as "Save Changes"
                const resolveButton = document.querySelector('.btn-resolve');
                if (resolveButton) {
                    resolveButton.textContent = 'Save Changes';
                }
            } else if (this.value === 'reassign') {
                rescheduleOptions.style.display = 'none';
                reassignOptions.style.display = 'block';
                
                // Keep button text as "Save Changes"
                const resolveButton = document.querySelector('.btn-resolve');
                if (resolveButton) {
                    resolveButton.textContent = 'Save Changes';
                }
                
                // Get the current conflict and refresh available units
                const conflictIndex = parseInt(document.getElementById('resolution-form').getAttribute('data-conflict-index'));
                const conflicts = JSON.parse(sessionStorage.getItem('missionConflicts')) || [];
                if (!isNaN(conflictIndex) && conflictIndex < conflicts.length) {
                    populateAvailableUnits(conflicts[conflictIndex]);
                }
            } else {
                rescheduleOptions.style.display = 'none';
                reassignOptions.style.display = 'none';
                
                // Keep button text as "Save Changes"
                const resolveButton = document.querySelector('.btn-resolve');
                if (resolveButton) {
                    resolveButton.textContent = 'Save Changes';
                }
            }
        });
    }
    
    // Handle form submission
    const resolutionForm = document.getElementById('resolution-form');
    if (resolutionForm) {
        resolutionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get the conflict index from the form
            const conflictIndex = parseInt(this.getAttribute('data-conflict-index'));
            const conflicts = JSON.parse(sessionStorage.getItem('missionConflicts')) || [];
            
            if (isNaN(conflictIndex) || conflictIndex >= conflicts.length) {
                alert('No conflict selected');
                return;
            }
            
            const conflict = conflicts[conflictIndex];
            const resolutionType = document.getElementById('resolution-type').value;
            
            // Get missions from localStorage
            const missions = JSON.parse(localStorage.getItem('missions')) || [];
            
            // Apply the resolution based on the selected type
            if (resolutionType === 'reschedule') {
                // Get new date and times
                const newDate = document.getElementById('new-date').value;
                const newStartTime = document.getElementById('new-start-time').value;
                const newEndTime = document.getElementById('new-end-time').value;
                
                if (!newDate || !newStartTime || !newEndTime) {
                    alert('Please fill in all date and time fields');
                    return;
                }
                
                // Validate the new time doesn't create new conflicts
                if (!validateNewSchedule(newDate, newStartTime, newEndTime, conflict.mission2Index, missions)) {
                    return; // Validation failed, message already shown to user
                }
                
                // Update the second mission with the new schedule
                missions[conflict.mission2Index].date = newDate;
                missions[conflict.mission2Index].startTime = newStartTime;
                missions[conflict.mission2Index].endTime = newEndTime;
                
                // Save changes
                localStorage.setItem('missions', JSON.stringify(missions));
                
                // Show success message
                alert(`Mission #${1138 + conflict.mission2Index} "${missions[conflict.mission2Index].name}" has been rescheduled to ${newDate} ${formatTimeWithAMPM(newStartTime)} - ${formatTimeWithAMPM(newEndTime)}`);
                
            } else if (resolutionType === 'reassign') {
                // Get selected units to reassign
            const selectedUnits = [];
                document.querySelectorAll('#reassign-options .unit-checkboxes input:checked').forEach(checkbox => {
                selectedUnits.push(checkbox.value);
            });
            
                if (selectedUnits.length === 0) {
                    alert('Please select at least one unit to reassign');
                return;
            }
            
                // Get the new unit to assign to
                const newUnit = document.getElementById('new-unit').value;
                
                if (!newUnit) {
                    alert('Please select a unit to assign to');
                    return;
                }
                
                // Update both missions by removing the selected units and adding the new one
                selectedUnits.forEach(unitToReassign => {
                    // Remove from mission 1
                    missions[conflict.mission1Index].units = missions[conflict.mission1Index].units.filter(
                        unit => unit !== unitToReassign
                    );
                    
                    // Remove from mission 2
                    missions[conflict.mission2Index].units = missions[conflict.mission2Index].units.filter(
                        unit => unit !== unitToReassign
                    );
                });
                
                // Add the new unit to mission 2
                if (!missions[conflict.mission2Index].units.includes(newUnit)) {
                    missions[conflict.mission2Index].units.push(newUnit);
                }
                
                // Save changes
            localStorage.setItem('missions', JSON.stringify(missions));
            
                // Show success message
                alert(`Units have been reassigned for Mission #${1138 + conflict.mission2Index} "${missions[conflict.mission2Index].name}"`);
                
            } else if (resolutionType === 'cancel') {
                // Get notes
                const notes = document.getElementById('resolution-notes').value || 'No notes provided';
                
                // Archive the second mission
                const archivedMissions = JSON.parse(localStorage.getItem('archivedMissions')) || [];
                
                // Add cancellation note to the mission
                missions[conflict.mission2Index].cancellationReason = notes;
                missions[conflict.mission2Index].status = 'CANCELLED';
                
                // Store mission name for the alert
                const missionName = missions[conflict.mission2Index].name;
                const missionId = 1138 + conflict.mission2Index;
                
                // Add to archived missions
                archivedMissions.push(missions[conflict.mission2Index]);
                
                // Remove from active missions
                missions.splice(conflict.mission2Index, 1);
                
                // Save changes
                localStorage.setItem('missions', JSON.stringify(missions));
                localStorage.setItem('archivedMissions', JSON.stringify(archivedMissions));
                
                // Show success message
                alert(`Mission #${missionId} "${missionName}" has been cancelled and moved to archives`);
            }
            
            // Refresh the conflicts
            checkMissionConflicts();
            
            // Refresh the mission list
            loadMissions();
            
            // If no more conflicts, go back to active missions tab
            const remainingConflicts = JSON.parse(sessionStorage.getItem('missionConflicts')) || [];
            if (remainingConflicts.length === 0) {
                const activeTab = document.querySelector('[data-tab="active-missions"]');
                if (activeTab) {
                    activeTab.click();
                }
            } else {
                // Refresh the conflict resolution tab
                populateConflictResolutionTab();
            }
        });
    }
    
    // Tab change handler to populate conflicts
    const conflictsTabBtn = document.querySelector('[data-tab="resolve-conflicts"]');
    if (conflictsTabBtn) {
        conflictsTabBtn.addEventListener('click', function() {
            // Populate the conflicts tab when it's selected
            populateConflictResolutionTab();
        });
    }
    
    // Initial button text update
    const resolveButton = document.querySelector('.btn-resolve');
    if (resolveButton && resolutionType) {
        // Always use "Save Changes" as the button text
        resolveButton.textContent = 'Save Changes';
    }
}

// Function to validate a new schedule doesn't create new conflicts
function validateNewSchedule(newDate, newStartTime, newEndTime, currentMissionIndex, missions) {
    // Convert to minutes for easier comparison
    const newStart = parseTimeToMinutes(newStartTime);
    const newEnd = parseTimeToMinutes(newEndTime);
    
    // Check if start time is after end time
    if (newStart >= newEnd) {
        alert('Error: Start time must be before end time');
        return false;
    }
    
    // Get all units from the mission being rescheduled
    const units = missions[currentMissionIndex].units || [];
    
    // Check if any of these units are already assigned to other missions at the new time
    const conflicts = [];
    
    missions.forEach((mission, index) => {
        // Skip the mission we're rescheduling
        if (index === currentMissionIndex) return;
        
        // Skip if not on the same date
        if (mission.date !== newDate) return;
        
        // Skip if no units or no overlapping units
        if (!mission.units || mission.units.length === 0) return;
        const sharedUnits = mission.units.filter(unit => units.includes(unit));
        if (sharedUnits.length === 0) return;
        
        // Check if times overlap
        const missionStart = parseTimeToMinutes(mission.startTime);
        const missionEnd = parseTimeToMinutes(mission.endTime);
        
        if ((newStart < missionEnd) && (missionStart < newEnd)) {
            conflicts.push({
                missionId: 1138 + index,
                name: mission.name,
                time: `${formatTimeWithAMPM(mission.startTime)} - ${formatTimeWithAMPM(mission.endTime)}`,
                units: sharedUnits
            });
        }
    });
    
    if (conflicts.length > 0) {
        // Construct warning message
        let message = 'Warning: The new schedule creates conflicts with other missions:\n\n';
        conflicts.forEach(conflict => {
            message += `- Mission #${conflict.missionId} (${conflict.name}) at ${conflict.time}\n`;
            message += `  Shared units: ${conflict.units.join(', ')}\n\n`;
        });
        message += 'Do you want to continue anyway?';
        
        return confirm(message);
    }
    
    return true;
}

// Attach event listeners to action buttons
function attachActionButtonListeners() {
    const actionButtons = document.querySelectorAll('.btn-action');
    
    // Create route preview element if it doesn't exist
    let routePreview = document.getElementById('route-preview');
    if (!routePreview) {
        routePreview = document.createElement('div');
        routePreview.id = 'route-preview';
        routePreview.className = 'route-preview action-preview';
        document.body.appendChild(routePreview);
    }
    
    // Track which preview is currently active
    let activeButton = null;
    let isPreviewVisible = false;
    
    actionButtons.forEach(button => {
        // Get the route data from the parent row
        const row = button.closest('tr');
        const routeData = row.getAttribute('data-route');
        const missionId = row.getAttribute('data-mission-id');
        
        // Add click handler for navigation
        button.addEventListener('click', () => {
            // Get the mission index from the missionId (format: #1138)
            const index = parseInt(missionId.replace('#', '')) - 1138;
            openMissionEditModal(index);
        });
        
        // Only add hover effect if the mission has route data
        if (routeData) {
            const routePoints = JSON.parse(routeData);
            
            // Add mouseenter event to show preview
            button.addEventListener('mouseenter', (e) => {
                // Set this button as the active one
                activeButton = button;
                
                // Show route preview
                showRoutePreview(routePoints, routePreview, e, true);
                isPreviewVisible = true;
                
                // Add event listener to the document to check mouse position
                document.addEventListener('mousemove', checkMousePosition);
            });
        }
    });
    
    // Function to check if mouse is over button or preview
    function checkMousePosition(e) {
        if (!isPreviewVisible || !activeButton) return;
        
        const buttonRect = activeButton.getBoundingClientRect();
        const previewRect = routePreview.getBoundingClientRect();
        
        const isOverButton = (
            e.clientX >= buttonRect.left && 
            e.clientX <= buttonRect.right && 
            e.clientY >= buttonRect.top && 
            e.clientY <= buttonRect.bottom
        );
        
        const isOverPreview = (
            e.clientX >= previewRect.left && 
            e.clientX <= previewRect.right && 
            e.clientY >= previewRect.top && 
            e.clientY <= previewRect.bottom
        );
        
        // Hide the preview if mouse is neither over button nor preview
        if (!isOverButton && !isOverPreview) {
            routePreview.style.display = 'none';
            isPreviewVisible = false;
            activeButton = null;
            document.removeEventListener('mousemove', checkMousePosition);
        }
    }
}

// Attach event listeners to tracking buttons
function attachTrackingButtonListeners() {
    const trackingButtons = document.querySelectorAll('.btn-track');
    
    trackingButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the mission ID from the data attribute
            const missionId = button.getAttribute('data-mission-id');
            
            // Navigate to the tracking page with the mission ID as a parameter
            window.location.href = `tracking.html?mission=${missionId}`;
        });
    });
}

// Add route preview popup on hover for rows
function addRoutePreviewToMissions() {
    const missionRows = document.querySelectorAll('.mission-table tbody tr:not(.empty-state)');
    
    // Create route preview element if it doesn't exist
    let routePreview = document.getElementById('row-preview');
    if (!routePreview) {
        routePreview = document.createElement('div');
        routePreview.id = 'row-preview';
        routePreview.className = 'route-preview';
        document.body.appendChild(routePreview);
    }
    
    missionRows.forEach(row => {
        // Only add hover effect if the mission has route data
        const routeData = row.getAttribute('data-route');
        if (!routeData) return;
        
        // Parse the route data
        const routePoints = JSON.parse(routeData);
        
        // Add hover event to show preview
        row.addEventListener('mouseenter', (e) => {
            showRoutePreview(routePoints, routePreview, e, false);
        });
        
        // Add mouseleave event to hide preview
        row.addEventListener('mouseleave', () => {
            routePreview.style.display = 'none';
        });
    });
}

// Show route preview
function showRoutePreview(points, previewElement, event, isActionButton) {
    // Clear previous content
    previewElement.innerHTML = '';
    
    // Create preview map
    const previewMap = document.createElement('div');
    previewMap.className = 'preview-map';
    
    // Calculate position for popup placement
    if (isActionButton) {
        // Position to the left of the button
        const buttonRect = event.currentTarget.getBoundingClientRect();
        
        // Calculate centering for vertical positioning
        const previewHeight = 200; // Match height in CSS
        const topPosition = buttonRect.top - (previewHeight / 2) + (buttonRect.height / 2);
        
        // Ensure it stays within the viewport
        const adjustedTop = Math.max(10, Math.min(topPosition, window.innerHeight - previewHeight - 10));
        
        previewElement.style.top = `${adjustedTop}px`;
        previewElement.style.left = `${buttonRect.left - 330}px`; // Wider, so position further left
        
        // Add mission ID to the preview
        const missionIdElement = document.createElement('div');
        missionIdElement.className = 'preview-title';
        const missionId = event.currentTarget.closest('tr').getAttribute('data-mission-id');
        missionIdElement.textContent = `Route for ${missionId}`;
        previewElement.appendChild(missionIdElement);
    } else {
        // Position for row hover
        const rect = event.currentTarget.getBoundingClientRect();
        previewElement.style.top = `${rect.top - 10}px`;
        previewElement.style.left = `${rect.right + 10}px`;
    }
    
    // Add grid lines
    const grid = document.createElement('div');
    grid.className = 'preview-grid';
    for (let i = 1; i <= 3; i++) {
        const hLine = document.createElement('div');
        hLine.className = 'preview-grid-line horizontal';
        hLine.style.top = `${i * 25}%`;
        grid.appendChild(hLine);
        
        const vLine = document.createElement('div');
        vLine.className = 'preview-grid-line vertical';
        vLine.style.left = `${i * 25}%`;
        grid.appendChild(vLine);
    }
    previewMap.appendChild(grid);
    
    // Add route points and lines
    const routePointsContainer = document.createElement('div');
    routePointsContainer.className = 'preview-route-points';
    
    // Add points with numbers
    points.forEach((point, index) => {
        const pointElement = document.createElement('div');
        pointElement.className = 'preview-point';
        pointElement.style.left = `${point.x}%`;
        pointElement.style.top = `${point.y}%`;
        pointElement.textContent = index + 1; // Show point number
        routePointsContainer.appendChild(pointElement);
        
        // Add line connecting to previous point
        if (index > 0) {
            const prevPoint = points[index - 1];
            
            // Create a straight line between points
            const lineElement = document.createElement('div');
            lineElement.className = 'preview-line';
            
            // Calculate line position and length
            const x1 = prevPoint.x;
            const y1 = prevPoint.y;
            const x2 = point.x;
            const y2 = point.y;
            
            // Estimate the dot radius as percentage of container width
            // Using 11px for a 22px dot
            const dotRadiusPercent = 11 / previewMap.offsetWidth * 100;
            
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
            
            // Set the line's width to the shortened distance
            lineElement.style.width = `${shortenedDistance}%`;
            
            // Position the line at the edge of the first dot
            lineElement.style.left = `${startX}%`;
            lineElement.style.top = `${startY}%`;
            lineElement.style.transformOrigin = '0 50%';
            lineElement.style.transform = `rotate(${angleDeg}deg)`;
            
            // Add line to the container before the points to ensure points appear on top
            routePointsContainer.insertBefore(lineElement, routePointsContainer.firstChild);
        }
    });
    
    previewMap.appendChild(routePointsContainer);
    previewElement.appendChild(previewMap);
    
    // Show the preview
    previewElement.style.display = 'block';
}

// Mission filtering function
function filterMissions(filterValue) {
    const rows = document.querySelectorAll('.mission-table tbody tr');
    
    rows.forEach(row => {
        const statusCell = row.querySelector('td:nth-child(4)');
        if (!statusCell) return;
        
        const statusText = statusCell.textContent.trim();
        
        if (filterValue === 'all') {
            row.style.display = '';
        } else if (filterValue === 'active' && statusText === 'ACTIVE') {
            row.style.display = '';
        } else if (filterValue === 'pending' && statusText === 'PENDING') {
            row.style.display = '';
        } else if (filterValue === 'completed' && statusText === 'COMPLETED') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Mission sorting function
function sortMissions(sortBy) {
    const table = document.querySelector('.mission-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Sort rows based on selected option
    rows.sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === 'id') {
            aValue = a.cells[0].textContent.trim();
            bValue = b.cells[0].textContent.trim();
            return aValue.localeCompare(bValue, undefined, { numeric: true });
        } else if (sortBy === 'name') {
            aValue = a.cells[1].textContent.trim();
            bValue = b.cells[1].textContent.trim();
            return aValue.localeCompare(bValue);
        } else if (sortBy === 'status') {
            aValue = a.cells[3].textContent.trim();
            bValue = b.cells[3].textContent.trim();
            return aValue.localeCompare(bValue);
        }
        
        return 0;
    });
    
    // Re-append rows in sorted order
    rows.forEach(row => tbody.appendChild(row));
}

// Function to populate unit checkboxes in the mission edit modal
function populateUnitCheckboxes() {
    const unitCheckboxesContainer = document.querySelector('#mission-edit-modal .unit-checkboxes');
    
    // Clear existing checkboxes
    unitCheckboxesContainer.innerHTML = '';
    
    // Get units from localStorage
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    if (units.length === 0) {
        // If no units, show a message
        unitCheckboxesContainer.innerHTML = '<div class="empty-message">No units available. Please add units first.</div>';
        return;
    }
    
    // Add each unit as a checkbox
    units.forEach((unit, index) => {
        const unitItem = document.createElement('div');
        unitItem.className = 'unit-checkbox';
        
        // The value follows the pattern 'unit1', 'unit2', etc. to maintain compatibility
        const unitValue = `unit${index + 1}`;
        
        unitItem.innerHTML = `
            <input type="checkbox" id="edit-${unitValue}" value="${unitValue}">
            <label for="edit-${unitValue}">${unit.name} (${unit.id})</label>
        `;
        
        unitCheckboxesContainer.appendChild(unitItem);
    });
}

// Initialize mission edit functionality
function initMissionEditModal() {
    const modal = document.getElementById('mission-edit-modal');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('edit-mission-form');
    const deleteBtn = document.getElementById('delete-mission');
    
    // Populate unit checkboxes
    populateUnitCheckboxes();
    
    // Close modal when close button is clicked
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        
        // Close the calendar panel if it's open
        const missionPanel = document.getElementById('mission-details-panel');
        if (missionPanel && missionPanel.classList.contains('open')) {
            missionPanel.classList.remove('open');
            const calendarContainer = document.querySelector('.calendar-container');
            if (calendarContainer) {
                calendarContainer.classList.remove('panel-open');
            }
        }
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            
            // Close the calendar panel if it's open
            const missionPanel = document.getElementById('mission-details-panel');
            if (missionPanel && missionPanel.classList.contains('open')) {
                missionPanel.classList.remove('open');
                const calendarContainer = document.querySelector('.calendar-container');
                if (calendarContainer) {
                    calendarContainer.classList.remove('panel-open');
                }
            }
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const missionIndex = document.getElementById('edit-mission-index').value;
        const name = document.getElementById('edit-mission-name').value;
        const dateInput = document.getElementById('edit-mission-date').value;
        const status = document.getElementById('edit-mission-status').value;
        const startTimeInput = document.getElementById('edit-start-time').value;
        const endTimeInput = document.getElementById('edit-end-time').value;
        
        // Parse date from MM/DD/YYYY to YYYY-MM-DD
        let date = '';
        try {
            const [month, day, year] = dateInput.split('/');
            date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } catch (e) {
            console.error('Error parsing date:', e);
            date = dateInput; // Use as-is if parsing fails
        }
        
        // Parse times from "HH:MM AM/PM" to 24-hour format
        const startTime = parseTimeToTwentyFour(startTimeInput);
        const endTime = parseTimeToTwentyFour(endTimeInput);
        
        // Get selected units
        const units = [];
        document.querySelectorAll('.unit-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
            units.push(checkbox.value);
        });
        
        // Get missions from localStorage
        const missions = JSON.parse(localStorage.getItem('missions')) || [];
        const mission = missions[missionIndex];
        
        if (!mission) {
            console.error('Mission not found');
            return;
        }
        
        // Determine mission type based on name if not already set
        let missionType = mission.type || 'reconnaissance'; // Use explicit type if available
        
        // If no explicit type, try to determine from name
        if (!mission.type && mission.name) {
            const name = mission.name.toLowerCase();
            if (name.includes('patrol') || name.includes('combat')) {
                missionType = 'patrol';
            } else if (name.includes('exploration')) {
                missionType = 'exploration';
            } else if (name.includes('surveillance')) {
                missionType = 'surveillance';
            } else if (name.includes('investigation')) {
                missionType = 'investigation';
            } else if (name.includes('recon') || name.includes('reconnaissance')) {
                missionType = 'reconnaissance';
            } else if (name.includes('supply') || name.includes('resource')) {
                missionType = 'supply';
            } else if (name.includes('training') || name.includes('admin')) {
                missionType = 'training';
            }
        }
        
        // Update mission data
        mission.name = name;
        mission.date = date;
        mission.status = status;
        mission.startTime = startTime;
        mission.endTime = endTime;
        mission.units = units;
        mission.type = missionType; // Preserve or set mission type
        
        // Save updated missions to localStorage
        localStorage.setItem('missions', JSON.stringify(missions));
        
        // Reload missions table
        loadMissions();
        
        // Always refresh the calendar regardless of which tab is active
        // This ensures changes are reflected immediately in the calendar view
        initializeCalendar();
        
        // Close modal
        modal.classList.remove('active');
        
        // Close the calendar panel if it's open
        const missionPanel = document.getElementById('mission-details-panel');
        if (missionPanel && missionPanel.classList.contains('open')) {
            missionPanel.classList.remove('open');
            const calendarContainer = document.querySelector('.calendar-container');
            if (calendarContainer) {
                calendarContainer.classList.remove('panel-open');
            }
        }
    });
    
    // Handle delete button click
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this mission?')) {
            const missionIndex = document.getElementById('edit-mission-index').value;
            
            // Get missions from localStorage
            const missions = JSON.parse(localStorage.getItem('missions')) || [];
            
            // Get the mission to archive
            const missionToArchive = missions[missionIndex];
            
            // Archive the mission
            if (missionToArchive) {
                const archivedMissions = JSON.parse(localStorage.getItem('archivedMissions')) || [];
                archivedMissions.push(missionToArchive);
                localStorage.setItem('archivedMissions', JSON.stringify(archivedMissions));
            }
            
            // Remove mission at index
            missions.splice(missionIndex, 1);
            
            // Save updated missions to localStorage
            localStorage.setItem('missions', JSON.stringify(missions));
            
            // Reload missions table
            loadMissions();
            
            // Always refresh the calendar regardless of which tab is active
            initializeCalendar();
            
            // Close modal
            modal.classList.remove('active');
            
            // Close the calendar panel if it's open
            const missionPanel = document.getElementById('mission-details-panel');
            if (missionPanel && missionPanel.classList.contains('open')) {
                missionPanel.classList.remove('open');
                const calendarContainer = document.querySelector('.calendar-container');
                if (calendarContainer) {
                    calendarContainer.classList.remove('panel-open');
                }
            }
        }
    });
}

// Helper function to parse time from "HH:MM AM/PM" to 24-hour format
function parseTimeToTwentyFour(timeString) {
    if (!timeString) return '';
    
    try {
        // Extract hours, minutes, and AM/PM
        const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
        const match = timeString.match(timeRegex);
        
        if (!match) return timeString; // Return as-is if format doesn't match
        
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3].toUpperCase();
        
        // Convert to 24-hour format
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } catch (e) {
        console.error('Error parsing time:', e);
        return timeString;
    }
}

// Open mission edit modal with mission details
function openMissionEditModal(missionIndex) {
    // Get missions from localStorage
    const missions = JSON.parse(localStorage.getItem('missions')) || [];
    const mission = missions[missionIndex];
    
    if (!mission) {
        console.error('Mission not found');
        return;
    }
    
    // Get modal elements
    const modal = document.getElementById('mission-edit-modal');
    const titleElement = document.getElementById('edit-mission-title');
    const nameInput = document.getElementById('edit-mission-name');
    const dateInput = document.getElementById('edit-mission-date');
    const statusSelect = document.getElementById('edit-mission-status');
    const startTimeInput = document.getElementById('edit-start-time');
    const endTimeInput = document.getElementById('edit-end-time');
    const missionIndexInput = document.getElementById('edit-mission-index');
    
    // Populate unit checkboxes
    populateUnitCheckboxes();
    
    // Set mission data in the form
    titleElement.textContent = `Editing mission #${1138 + missionIndex}`;
    nameInput.value = mission.name;
    
    // Format date as MM/DD/YYYY
    const dateObj = new Date(mission.date);
    const formattedDate = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
    dateInput.value = formattedDate;
    
    statusSelect.value = mission.status;
    
    // Format times with AM/PM
    startTimeInput.value = formatTimeWithAMPM(mission.startTime);
    endTimeInput.value = formatTimeWithAMPM(mission.endTime);
    
    missionIndexInput.value = missionIndex;
    
    // Check unit checkboxes based on mission units
    mission.units.forEach(unit => {
        const checkbox = document.getElementById(`edit-${unit}`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    // Show the modal
    modal.classList.add('active');
}

// Helper function to format time with AM/PM
function formatTimeWithAMPM(timeString) {
    // Handle case where timeString might be in 24-hour format (HH:MM)
    if (!timeString) return '';
    
    try {
        const [hours, minutes] = timeString.split(':');
        const hoursNum = parseInt(hours, 10);
        
        if (hoursNum === 0) {
            return `12:${minutes} AM`;
        } else if (hoursNum < 12) {
            return `${hoursNum}:${minutes} AM`;
        } else if (hoursNum === 12) {
            return `12:${minutes} PM`;
        } else {
            return `${hoursNum - 12}:${minutes} PM`;
        }
    } catch (e) {
        console.error('Error formatting time:', e);
        return timeString;
    }
}

// Initialize sample unit data if none exists
function initializeSampleUnits() {
    let units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Only add sample data if no units exist
    if (units.length === 0) {
        const sampleUnits = [
            {
                id: 'CJ001',
                name: 'Alpha Squad',
                status: 'ACTIVE',
                type: 'Combat',
                members: 5
            },
            {
                id: 'CJ002',
                name: 'Bravo Team',
                status: 'ACTIVE',
                type: 'Recon',
                members: 3
            },
            {
                id: 'CJ003',
                name: 'Charlie Unit',
                status: 'MAINTENANCE',
                type: 'Support',
                members: 4
            },
            {
                id: 'CJ004',
                name: 'Delta Force',
                status: 'ACTIVE',
                type: 'Special Ops',
                members: 6
            },
            {
                id: 'CJ005',
                name: 'Echo Squad',
                status: 'TRAINING',
                type: 'Combat',
                members: 4
            },
            {
                id: 'CJ006',
                name: 'Foxtrot Team',
                status: 'ACTIVE',
                type: 'Supply',
                members: 3
            }
        ];
        
        // Save to localStorage
        localStorage.setItem('units', JSON.stringify(sampleUnits));
    }
} 