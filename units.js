document.addEventListener('DOMContentLoaded', function() {
    // Initialize units if not already in localStorage
    if (!localStorage.getItem('units')) {
        // Sample initial units data
        const initialUnits = [
            {
                id: 'U001',
                name: 'Alpha Squad',
                status: 'In Progress',
                mission: 'Woodland Recon',
                location: 'Grid A-12'
            },
            {
                id: 'U002',
                name: 'Bravo Team',
                status: 'Active',
                mission: 'Supply Run',
                location: 'Grid B-08'
            }
        ];
        localStorage.setItem('units', JSON.stringify(initialUnits));
    }

    // Load units from localStorage
    loadUnits();
    
    // Update unit status statistics
    updateUnitStatusStats();
    
    // Initialize unit history
    initializeUnitHistory();

    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // If unit history tab is selected, refresh the history view
            if (tabId === 'unit-history') {
                const selectedUnit = document.getElementById('history-unit-filter').value;
                updateUnitHistory(selectedUnit);
            }
        });
    });

    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.textContent.toLowerCase();
            if (page === 'missions') {
                window.location.href = 'dashboard.html';
            } else if (page === 'tracking') {
                window.location.href = 'tracking.html';
            } else if (page === 'comms') {
                window.location.href = 'messaging.html';
            } else if (page === 'reports') {
                window.location.href = 'reports.html';
            } else if (page === 'settings') {
                window.location.href = 'settings.html';
            }
        });
    });

    // Filter functionality
    const filterDropdown = document.getElementById('unit-filter-dropdown');
    filterDropdown.addEventListener('change', function() {
        const filterValue = this.value;
        const rows = document.querySelectorAll('#units-table-body tr');
        
        rows.forEach(row => {
            const statusCell = row.querySelector('td:nth-child(3)');
            const status = statusCell.textContent.toLowerCase();
            
            if (filterValue === 'all' || status.includes(filterValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Sort functionality
    const sortDropdown = document.getElementById('unit-sort-dropdown');
    sortDropdown.addEventListener('change', function() {
        const sortValue = this.value;
        const tbody = document.getElementById('units-table-body');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            let aValue, bValue;
            
            switch(sortValue) {
                case 'id':
                    aValue = a.cells[0].textContent;
                    bValue = b.cells[0].textContent;
                    break;
                case 'name':
                    aValue = a.cells[1].textContent;
                    bValue = b.cells[1].textContent;
                    break;
                case 'status':
                    aValue = a.cells[2].textContent;
                    bValue = b.cells[2].textContent;
                    break;
            }

            return aValue.localeCompare(bValue);
        });

        // Reorder the rows in the table
        rows.forEach(row => tbody.appendChild(row));
    });

    // Add New Unit button functionality
    const addNewUnitBtn = document.querySelector('.btn-create');
    addNewUnitBtn.addEventListener('click', () => {
        openAddUnitModal();
    });

    // View Details button functionality
    const viewDetailsButtons = document.querySelectorAll('.action-btn');
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', () => {
            const row = button.closest('tr');
            const unitId = row.cells[0].textContent;
            const unitName = row.cells[1].textContent;
            
            // This would typically open a modal with unit details
            alert(`Viewing details for ${unitName} (${unitId})`);
        });
    });

    // Initialize the Add Unit Modal functionality
    initAddUnitModal();
});

// Function to load units from localStorage and populate the table
function loadUnits() {
    const units = JSON.parse(localStorage.getItem('units')) || [];
    const tbody = document.getElementById('units-table-body');
    
    // Clear existing table rows
    tbody.innerHTML = '';
    
    // Add units to table
    if (units.length === 0) {
        // Display empty state if no units
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">
                    <div class="empty-message">No units to display. Add a new unit to get started.</div>
                </td>
            </tr>
        `;
    } else {
        // Add each unit to the table
        units.forEach(unit => {
            const statusClass = getStatusClass(unit.status);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${unit.id}</td>
                <td>${unit.name}</td>
                <td><span class="status-badge ${statusClass}">${unit.status}</span></td>
                <td>${unit.mission || 'None'}</td>
                <td>${unit.location || 'Unknown'}</td>
                <td>
                    <button class="action-btn">View Details</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Reattach event listeners for view details buttons
        const viewDetailsButtons = document.querySelectorAll('.action-btn');
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', () => {
                const row = button.closest('tr');
                const unitId = row.cells[0].textContent;
                const unitName = row.cells[1].textContent;
                
                // This would typically open a modal with unit details
                alert(`Viewing details for ${unitName} (${unitId})`);
            });
        });
    }
}

// Helper function to get the CSS class for a status
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'active':
            return 'active';
        case 'in progress':
            return 'in-progress';
        case 'maintenance':
            return 'maintenance';
        default:
            return '';
    }
}

// Function to update the unit status statistics
function updateUnitStatusStats() {
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Count units by status
    const statusCounts = {
        'active': 0,
        'in progress': 0,
        'maintenance': 0
    };
    
    units.forEach(unit => {
        const status = unit.status.toLowerCase();
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });
    
    // Calculate total units
    const totalUnits = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    // Update the status statistics in the UI
    document.querySelector('#unit-status .stat-item:nth-child(1) .stat-value').textContent = statusCounts['active'];
    document.querySelector('#unit-status .stat-item:nth-child(2) .stat-value').textContent = statusCounts['in progress'];
    document.querySelector('#unit-status .stat-item:nth-child(3) .stat-value').textContent = statusCounts['maintenance'];
    
    // Update chart bars and percentages
    if (totalUnits > 0) {
        const activePercent = Math.round((statusCounts['active'] / totalUnits) * 100);
        const inProgressPercent = Math.round((statusCounts['in progress'] / totalUnits) * 100);
        const maintenancePercent = Math.round((statusCounts['maintenance'] / totalUnits) * 100);
        
        document.getElementById('active-bar').style.width = `${activePercent}%`;
        document.getElementById('in-progress-bar').style.width = `${inProgressPercent}%`;
        document.getElementById('maintenance-bar').style.width = `${maintenancePercent}%`;
        
        document.getElementById('active-percent').textContent = `${activePercent}%`;
        document.getElementById('in-progress-percent').textContent = `${inProgressPercent}%`;
        document.getElementById('maintenance-percent').textContent = `${maintenancePercent}%`;
    } else {
        document.getElementById('active-bar').style.width = '0%';
        document.getElementById('in-progress-bar').style.width = '0%';
        document.getElementById('maintenance-bar').style.width = '0%';
        
        document.getElementById('active-percent').textContent = '0%';
        document.getElementById('in-progress-percent').textContent = '0%';
        document.getElementById('maintenance-percent').textContent = '0%';
    }
    
    // Update units list
    updateUnitsList('all');
    
    // Initialize status tabs if not already done
    initStatusTabs();
}

// Function to update the units list based on selected status
function updateUnitsList(statusFilter) {
    const units = JSON.parse(localStorage.getItem('units')) || [];
    const unitsList = document.getElementById('status-units-list');
    
    // Clear existing list
    unitsList.innerHTML = '';
    
    // Filter units by status if needed
    const filteredUnits = statusFilter === 'all' 
        ? units 
        : units.filter(unit => unit.status.toLowerCase() === statusFilter.replace('-', ' '));
    
    if (filteredUnits.length === 0) {
        unitsList.innerHTML = `
            <div class="empty-message">No units with ${statusFilter === 'all' ? 'any' : statusFilter.replace('-', ' ')} status.</div>
        `;
        return;
    }
    
    // Add units to the list
    filteredUnits.forEach(unit => {
        const statusClass = getStatusClass(unit.status);
        
        const unitItem = document.createElement('div');
        unitItem.className = 'unit-item';
        unitItem.innerHTML = `
            <div class="unit-status-indicator ${statusClass}"></div>
            <div class="unit-info">
                <div class="unit-name">${unit.name} (${unit.id})</div>
                <div class="unit-details">
                    ${unit.mission ? `Mission: ${unit.mission}` : 'No active mission'} • 
                    Location: ${unit.location || 'Unknown'}
                </div>
            </div>
        `;
        
        unitsList.appendChild(unitItem);
    });
}

// Function to initialize status tabs
function initStatusTabs() {
    // Skip if already initialized
    if (document.querySelector('.status-tab.initialized')) {
        return;
    }
    
    const statusTabs = document.querySelectorAll('.status-tab');
    
    statusTabs.forEach(tab => {
        // Mark as initialized
        tab.classList.add('initialized');
        
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            statusTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Update units list based on selected status
            const status = tab.getAttribute('data-status');
            updateUnitsList(status);
        });
    });
}

// Function to initialize unit history
function initializeUnitHistory() {
    const unitFilter = document.getElementById('history-unit-filter');
    
    // Clear existing options except "All Units"
    while (unitFilter.options.length > 1) {
        unitFilter.remove(1);
    }
    
    // Get all units
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Add unit options to filter dropdown
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.id;
        option.textContent = `${unit.name} (${unit.id})`;
        unitFilter.appendChild(option);
    });
    
    // Add event listener for filter changes
    unitFilter.addEventListener('change', function() {
        updateUnitHistory(this.value);
    });
    
    // Initialize with "All Units" selected
    updateUnitHistory('all');
}

// Function to update unit history based on selected unit
function updateUnitHistory(unitId) {
    const historyTimeline = document.getElementById('history-timeline');
    const units = JSON.parse(localStorage.getItem('units')) || [];
    const missions = JSON.parse(localStorage.getItem('missions')) || [];
    const archivedMissions = JSON.parse(localStorage.getItem('archivedMissions')) || [];
    
    // Combine active and archived missions
    const allMissions = [...missions, ...archivedMissions];
    
    // Clear existing history items
    historyTimeline.innerHTML = '';
    
    // If no missions or units, show empty message
    if (allMissions.length === 0 || units.length === 0) {
        historyTimeline.innerHTML = '<div class="empty-message">No mission history available</div>';
        return;
    }
    
    if (unitId === 'all') {
        // Group missions by unit for "All Units" view
        const unitHistoryMap = new Map();
        
        // Process each unit
        units.forEach((unit, unitIndex) => {
            // Find missions for this unit
            const unitMissions = allMissions.filter(mission => {
                return mission.units.includes(`unit${unitIndex + 1}`);
            });
            
            if (unitMissions.length > 0) {
                // Sort missions by date (most recent first)
                unitMissions.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                });
                
                unitHistoryMap.set(unit, unitMissions);
            }
        });
        
        // If no units have missions
        if (unitHistoryMap.size === 0) {
            historyTimeline.innerHTML = '<div class="empty-message">No mission history available</div>';
            return;
        }
        
        // Create unit sections for each unit with missions
        unitHistoryMap.forEach((missions, unit) => {
            const unitSection = document.createElement('div');
            unitSection.className = 'unit-history-section';
            
            // Create unit header
            const unitHeader = document.createElement('div');
            unitHeader.className = 'unit-history-header';
            unitHeader.innerHTML = `
                <div class="unit-history-name">${unit.name} <span class="unit-history-id">${unit.id}</span></div>
                <div class="unit-history-status ${getStatusClass(unit.status)}">${unit.status}</div>
            `;
            unitSection.appendChild(unitHeader);
            
            // Create missions list for this unit
            const missionsList = document.createElement('div');
            missionsList.className = 'unit-missions-list';
            
            // Add each mission for this unit
            missions.forEach(mission => {
                const missionType = getMissionType(mission);
                const missionItem = document.createElement('div');
                missionItem.className = `unit-mission-item ${missionType}`;
                
                // Format date
                const missionDate = new Date(mission.date);
                const formattedDate = `${missionDate.getMonth() + 1}/${missionDate.getDate()}/${missionDate.getFullYear()}`;
                
                missionItem.innerHTML = `
                    <div class="mission-date-indicator">${formattedDate}</div>
                    <div class="mission-content">
                        <div class="mission-name-row">
                            <div class="mission-name">${mission.name}</div>
                            <span class="mission-status ${mission.status.toLowerCase()}">${mission.status}</span>
                        </div>
                        <div class="mission-details">
                            <div class="mission-time">${mission.startTime} - ${mission.endTime}</div>
                        </div>
                    </div>
                `;
                
                missionsList.appendChild(missionItem);
            });
            
            unitSection.appendChild(missionsList);
            historyTimeline.appendChild(unitSection);
        });
    } else {
        // Single unit view
        const selectedUnit = units.find(unit => unit.id === unitId);
        
        if (!selectedUnit) {
            historyTimeline.innerHTML = '<div class="empty-message">Unit not found</div>';
            return;
        }
        
        // Find the unit index in the units array
        const unitIndex = units.findIndex(u => u.id === unitId);
        
        // Get missions for this specific unit
        const unitMissions = allMissions.filter(mission => {
            return mission.units.includes(`unit${unitIndex + 1}`);
        });
        
        if (unitMissions.length === 0) {
            historyTimeline.innerHTML = '<div class="empty-message">No mission history for this unit</div>';
            return;
        }
        
        // Sort missions by date (most recent first)
        unitMissions.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        // Create unit header for single unit view
        const unitHeader = document.createElement('div');
        unitHeader.className = 'unit-history-header single-unit';
        unitHeader.innerHTML = `
            <div class="unit-history-name">${selectedUnit.name} <span class="unit-history-id">${selectedUnit.id}</span></div>
            <div class="unit-history-status ${getStatusClass(selectedUnit.status)}">${selectedUnit.status}</div>
        `;
        historyTimeline.appendChild(unitHeader);
        
        // Create missions list for this unit
        const missionsList = document.createElement('div');
        missionsList.className = 'unit-missions-list';
        
        // Add each mission for this unit
        unitMissions.forEach(mission => {
            const missionType = getMissionType(mission);
            const missionItem = document.createElement('div');
            missionItem.className = `unit-mission-item ${missionType}`;
            
            // Format date
            const missionDate = new Date(mission.date);
            const formattedDate = `${missionDate.getMonth() + 1}/${missionDate.getDate()}/${missionDate.getFullYear()}`;
            
            missionItem.innerHTML = `
                <div class="mission-date-indicator">${formattedDate}</div>
                <div class="mission-content">
                    <div class="mission-name-row">
                        <div class="mission-name">${mission.name}</div>
                        <span class="mission-status ${mission.status.toLowerCase()}">${mission.status}</span>
                    </div>
                    <div class="mission-details">
                        <div class="mission-time">${mission.startTime} - ${mission.endTime}</div>
                    </div>
                </div>
            `;
            
            missionsList.appendChild(missionItem);
        });
        
        historyTimeline.appendChild(missionsList);
    }
}

// Helper function to determine mission type based on name or type property
function getMissionType(mission) {
    if (mission.type) {
        return mission.type.toLowerCase();
    }
    
    const name = mission.name.toLowerCase();
    if (name.includes('recon')) {
        return 'recon';
    } else if (name.includes('combat') || name.includes('patrol')) {
        return 'combat';
    } else if (name.includes('supply') || name.includes('resource')) {
        return 'supply';
    } else if (name.includes('training')) {
        return 'training';
    }
    
    return '';
}

// Function to open the Add Unit modal
function openAddUnitModal() {
    const modal = document.getElementById('unit-add-modal');
    modal.classList.add('active');
    
    // Clear the form
    document.getElementById('add-unit-form').reset();
    
    // Generate a new unit ID
    const units = JSON.parse(localStorage.getItem('units')) || [];
    let newId = 'U001';
    
    if (units.length > 0) {
        // Extract the highest numeric part from existing IDs
        const highestNumericPart = units
            .map(unit => parseInt(unit.id.replace(/\D/g, ''), 10))
            .reduce((max, num) => num > max ? num : max, 0);
        
        // Create the new ID with leading zeros
        newId = 'U' + String(highestNumericPart + 1).padStart(3, '0');
    }
    
    // Set the generated ID in the form
    document.getElementById('new-unit-id').value = newId;
}

// Function to initialize the Add Unit modal functionality
function initAddUnitModal() {
    const modal = document.getElementById('unit-add-modal');
    const closeBtn = document.getElementById('close-unit-modal');
    const cancelBtn = document.getElementById('cancel-add-unit');
    const form = document.getElementById('add-unit-form');
    
    // Close modal when close button is clicked
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Close modal when cancel button is clicked
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const id = document.getElementById('new-unit-id').value;
        const name = document.getElementById('new-unit-name').value;
        const status = document.getElementById('new-unit-status').value;
        const mission = document.getElementById('new-unit-mission').value;
        const location = document.getElementById('new-unit-location').value;
        
        // Create new unit object
        const newUnit = {
            id,
            name,
            status,
            mission,
            location
        };
        
        // Add unit to localStorage
        const units = JSON.parse(localStorage.getItem('units')) || [];
        units.push(newUnit);
        localStorage.setItem('units', JSON.stringify(units));
        
        // Reload units table
        loadUnits();
        
        // Update unit status statistics
        updateUnitStatusStats();
        
        // Update unit history filter
        initializeUnitHistory();
        
        // Close modal
        modal.classList.remove('active');
    });
} 