// Reports Page Logic (Frontend Only, Demo Purposes)
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            if (target) {
                window.location.href = target;
            }
        });
    });

    // Report filters functionality
    const missionTypeFilter = document.getElementById('report-mission-type');
    const dateRangeFilter = document.getElementById('report-date-range');
    const missionSelect = document.getElementById('report-mission-select');

    missionTypeFilter.addEventListener('change', updateReports);
    dateRangeFilter.addEventListener('change', updateReports);
    
    // Mission selection dropdown for detailed reports
    if (missionSelect) {
        missionSelect.addEventListener('change', function() {
            if (this.value) {
                showMissionDetailReport(this.value);
            }
        });
    }
    
    // Back to list button functionality
    const backToListBtn = document.getElementById('back-to-list-btn');
    if (backToListBtn) {
        backToListBtn.addEventListener('click', function() {
            // Hide mission detail report and show missions list
            document.getElementById('mission-detail-report').style.display = 'none';
            document.querySelector('.report-missions-container').style.display = 'block';
        });
    }

    // Download buttons functionality
    document.getElementById('download-pdf').addEventListener('click', () => {
        generatePDF();
    });

    document.getElementById('download-csv').addEventListener('click', () => {
        generateCSV();
    });

    // Initialize reports
    updateReports();
});

// Function to get mission type name to match dashboard
function getMissionTypeName(type) {
    switch (type.toLowerCase()) {
        case 'reconnaissance': return 'Reconnaissance';
        case 'patrol': return 'Patrol';
        case 'exploration': return 'Exploration';
        case 'surveillance': return 'Surveillance';
        case 'investigation': return 'Investigation';
        // Keep old values for backward compatibility
        case 'recon': return 'Reconnaissance';
        case 'combat': return 'Patrol';
        case 'supply': return 'Supply';
        case 'training': return 'Training';
        default: return 'Unknown';
    }
}

// Function to parse time to display in AM/PM format
function formatTimeAMPM(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Format date from YYYY-MM-DD to MM/DD/YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
}

// Calculate mission duration in hours and minutes
function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 'N/A';
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    let totalStartMinutes = (startHours * 60) + startMinutes;
    let totalEndMinutes = (endHours * 60) + endMinutes;
    
    // Handle overnight missions
    if (totalEndMinutes < totalStartMinutes) {
        totalEndMinutes += 24 * 60; // Add 24 hours
    }
    
    const durationMinutes = totalEndMinutes - totalStartMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours} hr ${minutes} min`;
}

// Function to get filtered missions based on selected filters
function getFilteredMissions() {
    let missions = JSON.parse(localStorage.getItem('missions')) || [];
    const type = document.getElementById('report-mission-type').value;
    const range = document.getElementById('report-date-range').value;

    // Filter by type
    if (type !== 'all') {
        missions = missions.filter(mission => {
            // First check explicit type if available
            if (mission.type && mission.type.toLowerCase() === type.toLowerCase()) {
                return true;
            }
            
            // Otherwise, match based on name
            const name = (mission.name || '').toLowerCase();
            if (type === 'reconnaissance' && (name.includes('recon') || name.includes('reconnaissance'))) return true;
            if (type === 'patrol' && (name.includes('patrol') || name.includes('combat'))) return true;
            if (type === 'exploration' && name.includes('exploration')) return true;
            if (type === 'surveillance' && name.includes('surveillance')) return true;
            if (type === 'investigation' && name.includes('investigation')) return true;
            
            return false;
        });
    }

    // Filter by date range
    if (range !== 'all') {
        const days = parseInt(range, 10);
        const now = new Date();
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - days);
        
        missions = missions.filter(mission => {
            if (!mission.date) return false;
            const missionDate = new Date(mission.date);
            return missionDate >= cutoffDate;
        });
    }

    return missions;
}

// Update report data based on filters
function updateReports() {
    const missions = getFilteredMissions();

    // Update summary cards
    updateSummaryCards(missions);
    
    // Update mission table
    updateMissionTable(missions);
    
    // Update mission selection dropdown
    updateMissionSelect(missions);
    
    // Draw chart with the filtered missions
    drawMissionDurationChart(missions);
}

// Function to update summary cards
function updateSummaryCards(missions) {
    // Total Missions
    document.getElementById('total-missions').textContent = missions.length;

    // Calculate average duration
    let totalMinutes = 0;
    let missionCount = 0;
    let delayedCount = 0;
    
    missions.forEach(mission => {
        if (mission.startTime && mission.endTime) {
            const [startHours, startMinutes] = mission.startTime.split(':').map(Number);
            const [endHours, endMinutes] = mission.endTime.split(':').map(Number);
            
            let totalStartMinutes = (startHours * 60) + startMinutes;
            let totalEndMinutes = (endHours * 60) + endMinutes;
            
            // Handle overnight missions
            if (totalEndMinutes < totalStartMinutes) {
                totalEndMinutes += 24 * 60; // Add 24 hours
            }
            
            const duration = totalEndMinutes - totalStartMinutes;
            totalMinutes += duration;
            missionCount++;
            
            // Consider missions > 3 hours as potentially delayed for demo purposes
            if (duration > 180) {
                delayedCount++;
            }
        }
    });
    
    // Update Average Duration
    if (missionCount > 0) {
        const avgMinutes = Math.round(totalMinutes / missionCount);
        const hours = Math.floor(avgMinutes / 60);
        const minutes = avgMinutes % 60;
        document.getElementById('avg-duration').textContent = `${hours} hr ${minutes} min`;
    } else {
        document.getElementById('avg-duration').textContent = '0 hr 0 min';
    }
    
    // Update Delayed Missions
    document.getElementById('delayed-missions').textContent = delayedCount;
}

// Function to update the mission table
function updateMissionTable(missions) {
    const tableBody = document.getElementById('missions-table-body');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Get units from localStorage to map unit IDs to names
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    if (missions.length === 0) {
        // Add empty state row
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" class="empty-message">No missions found matching the selected criteria.</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add missions to table
    missions.forEach((mission, index) => {
        const missionId = `#${1138 + index}`;
        const row = document.createElement('tr');
        
        // Determine mission type
        let missionType = mission.type || 'reconnaissance';
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
        
        // Format date
        const formattedDate = mission.date ? formatDate(mission.date) : 'N/A';
        
        // Calculate duration
        const duration = calculateDuration(mission.startTime, mission.endTime);
        
        row.innerHTML = `
            <td>${missionId}</td>
            <td>${mission.name}</td>
            <td>${formattedDate}</td>
            <td>${duration}</td>
            <td>
                <span class="mission-type-indicator ${missionType}"></span>
                ${getMissionTypeName(missionType)}
            </td>
            <td><span class="status-${mission.status.toLowerCase()}">${mission.status}</span></td>
            <td>
                <button class="btn-view-report" data-mission-index="${index}">View Report</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view report buttons
    const viewReportButtons = document.querySelectorAll('.btn-view-report');
    viewReportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const missionIndex = this.getAttribute('data-mission-index');
            showMissionDetailReport(missionIndex);
        });
    });
}

// Function to update mission selection dropdown
function updateMissionSelect(missions) {
    const missionSelect = document.getElementById('report-mission-select');
    if (!missionSelect) return;
    
    // Clear existing options except the default one
    while (missionSelect.options.length > 1) {
        missionSelect.remove(1);
    }
    
    // Add missions to dropdown
    missions.forEach((mission, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `#${1138 + index} - ${mission.name}`;
        missionSelect.appendChild(option);
    });
}

// Function to show detailed mission report
function showMissionDetailReport(missionIndex) {
    const missions = getFilteredMissions();
    if (missionIndex >= missions.length) return;
    
    const mission = missions[missionIndex];
    if (!mission) return;
    
    // Hide missions list and show detail report
    document.querySelector('.report-missions-container').style.display = 'none';
    const detailReport = document.getElementById('mission-detail-report');
    detailReport.style.display = 'block';
    
    // Get units from localStorage to map unit IDs to names
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    // Update mission ID and name
    document.getElementById('detail-mission-id').textContent = `#${1138 + parseInt(missionIndex)}`;
    document.getElementById('detail-mission-name').textContent = mission.name;
    
    // Determine mission type
    let missionType = mission.type || 'reconnaissance';
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
    
    // Update mission type and indicator
    const typeIndicator = document.querySelector('#detail-mission-type .mission-type-indicator');
    typeIndicator.className = `mission-type-indicator ${missionType}`;
    document.getElementById('detail-type-text').textContent = getMissionTypeName(missionType);
    
    // Update mission status
    const statusBadge = document.getElementById('detail-mission-status');
    statusBadge.className = `mission-status-badge ${mission.status.toLowerCase()}`;
    statusBadge.textContent = mission.status;
    
    // Update mission details
    document.getElementById('detail-date').textContent = formatDate(mission.date);
    document.getElementById('detail-start-time').textContent = formatTimeAMPM(mission.startTime);
    document.getElementById('detail-end-time').textContent = formatTimeAMPM(mission.endTime);
    document.getElementById('detail-duration').textContent = calculateDuration(mission.startTime, mission.endTime);
    
    // Update assigned units
    let unitsText = 'None';
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
    }
    document.getElementById('detail-units').textContent = unitsText;
    
    // Generate a mission description based on available data
    let description = `Mission ${mission.name} is scheduled for ${formatDate(mission.date)}, starting at ${formatTimeAMPM(mission.startTime)} and ending at ${formatTimeAMPM(mission.endTime)}. `;
    description += `This is a ${getMissionTypeName(missionType)} mission with a duration of ${calculateDuration(mission.startTime, mission.endTime)}. `;
    
    if (mission.units && mission.units.length > 0) {
        description += `The mission has been assigned to the following units: ${unitsText}. `;
    }
    
    description += `The current status of this mission is ${mission.status}.`;
    
    document.getElementById('detail-description').textContent = description;
}

// Function to draw mission duration chart
function drawMissionDurationChart(missions) {
    const canvas = document.getElementById('mission-duration-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If no missions, show empty state
    if (missions.length === 0) {
        ctx.font = "18px Arial";
        ctx.fillStyle = "#999";
        ctx.textAlign = "center";
        ctx.fillText("No mission data available", canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Group by mission type
    const missionTypes = {
        'reconnaissance': { count: 0, totalDuration: 0, color: '#4caf50' },
        'patrol': { count: 0, totalDuration: 0, color: '#f44336' },
        'exploration': { count: 0, totalDuration: 0, color: '#2196f3' },
        'surveillance': { count: 0, totalDuration: 0, color: '#ffc107' },
        'investigation': { count: 0, totalDuration: 0, color: '#9c27b0' },
        // Keep old values for backward compatibility
        'recon': { count: 0, totalDuration: 0, color: '#4caf50' },
        'combat': { count: 0, totalDuration: 0, color: '#f44336' },
        'supply': { count: 0, totalDuration: 0, color: '#2196f3' },
        'training': { count: 0, totalDuration: 0, color: '#ffc107' }
    };
    
    // Process mission data
    missions.forEach(mission => {
        if (!mission.startTime || !mission.endTime) return;
        
        const [startHours, startMinutes] = mission.startTime.split(':').map(Number);
        const [endHours, endMinutes] = mission.endTime.split(':').map(Number);
        
        let totalStartMinutes = (startHours * 60) + startMinutes;
        let totalEndMinutes = (endHours * 60) + endMinutes;
        
        // Handle overnight missions
        if (totalEndMinutes < totalStartMinutes) {
            totalEndMinutes += 24 * 60; // Add 24 hours
        }
        
        const durationHours = (totalEndMinutes - totalStartMinutes) / 60;
        
        // Determine mission type
        let missionType = mission.type || 'reconnaissance';
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
        
        // Update counts and totals
        if (missionTypes[missionType]) {
            missionTypes[missionType].count++;
            missionTypes[missionType].totalDuration += durationHours;
        }
    });
    
    // Calculate average durations
    Object.keys(missionTypes).forEach(type => {
        if (missionTypes[type].count > 0) {
            missionTypes[type].avgDuration = missionTypes[type].totalDuration / missionTypes[type].count;
        } else {
            missionTypes[type].avgDuration = 0;
        }
    });
    
    // Draw bar chart
    const barWidth = 80;
    const barSpacing = 40;
    const chartHeight = canvas.height - 60;
    const chartBottom = canvas.height - 30;
    
    // Calculate max value for scaling
    const maxDuration = Math.max(
        missionTypes.reconnaissance.avgDuration,
        missionTypes.patrol.avgDuration,
        missionTypes.exploration.avgDuration,
        missionTypes.surveillance.avgDuration,
        missionTypes.investigation.avgDuration,
        4 // Minimum scale to ensure visibility
    );
    
    // Draw Y-axis and horizontal grid lines
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 30);
    ctx.lineTo(50, chartBottom);
    ctx.lineTo(canvas.width - 30, chartBottom);
    ctx.stroke();

    // Draw y-axis labels and grid lines
    ctx.fillStyle = "#ccc";
    ctx.textAlign = "right";
    ctx.font = "12px Arial";
    
    for (let i = 0; i <= 4; i++) {
        const value = (maxDuration * i) / 4;
        const y = chartBottom - (chartHeight * i) / 4;
        
        // Draw grid line
        ctx.strokeStyle = "#333";
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(canvas.width - 30, y);
        ctx.stroke();
        
        // Draw y-axis label
        ctx.fillText(value.toFixed(1) + " hrs", 45, y + 5);
    }
    
    // Draw bars
    let x = 100;
    const types = ['reconnaissance', 'patrol', 'exploration', 'surveillance', 'investigation'];
    
    types.forEach(type => {
        const data = missionTypes[type];
        const barHeight = (data.avgDuration / maxDuration) * chartHeight;
        
        // Draw bar
        ctx.fillStyle = data.color;
        ctx.fillRect(x, chartBottom - barHeight, barWidth, barHeight);
        
        // Draw value on top of bar
        if (data.avgDuration > 0) {
        ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.font = "14px Arial";
            ctx.fillText(data.avgDuration.toFixed(1) + " hrs", x + barWidth / 2, chartBottom - barHeight - 10);
        }
        
        // Draw mission type label
        ctx.fillStyle = "#ccc";
        ctx.font = "14px Arial";
        ctx.fillText(getMissionTypeName(type), x + barWidth / 2, chartBottom + 20);
        
        // Add count below type
        ctx.fillStyle = "#999";
        ctx.font = "12px Arial";
        ctx.fillText(`(${data.count} missions)`, x + barWidth / 2, chartBottom + 40);
        
        x += barWidth + barSpacing;
    });
    
    // Draw chart title
        ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "16px Arial";
    ctx.fillText("Average Mission Duration by Type", canvas.width / 2, 20);
}

// Function to generate PDF report
function generatePDF() {
    const missions = getFilteredMissions();
    
    // Create a basic text-based PDF (in a real application, use a proper PDF library)
    let content = "CHICKEN JOCKEY COORDINATION SYSTEM\n";
    content += "MISSION REPORT\n\n";
    content += "Generated on: " + new Date().toLocaleString() + "\n\n";
    
    // Add filter information
    const missionType = document.getElementById('report-mission-type').value;
    const dateRange = document.getElementById('report-date-range').value;
    content += "Filters: ";
    content += "Mission Type: " + (missionType === 'all' ? 'All' : getMissionTypeName(missionType)) + ", ";
    
    if (dateRange === 'all') {
        content += "Date Range: All\n\n";
    } else {
        content += "Date Range: Last " + dateRange + " days\n\n";
    }
    
    // Add summary statistics
    const totalMissions = missions.length;
    const avgDuration = document.getElementById('avg-duration').textContent;
    const delayedMissions = document.getElementById('delayed-missions').textContent;
    
    content += "SUMMARY:\n";
    content += "Total Missions: " + totalMissions + "\n";
    content += "Average Duration: " + avgDuration + "\n";
    content += "Delayed Missions: " + delayedMissions + "\n\n";
    
    // Add mission list
    content += "MISSION LIST:\n";
    content += "ID | Name | Date | Time | Duration | Type | Status\n";
    content += "--------------------------------------------------------------------------\n";
    
    // Get units from localStorage to map unit IDs to names
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    missions.forEach((mission, index) => {
        const missionId = `#${1138 + index}`;
        
        // Determine mission type
        let missionType = mission.type || 'reconnaissance';
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
        
        const formattedDate = mission.date ? formatDate(mission.date) : 'N/A';
        const timeRange = `${formatTimeAMPM(mission.startTime)} - ${formatTimeAMPM(mission.endTime)}`;
        const duration = calculateDuration(mission.startTime, mission.endTime);
        
        content += `${missionId} | ${mission.name} | ${formattedDate} | ${timeRange} | ${duration} | ${getMissionTypeName(missionType)} | ${mission.status}\n`;
    });
    
    // Create a blob and download
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mission_report.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to generate CSV report
function generateCSV() {
    const missions = getFilteredMissions();
    
    // Create CSV content
    let content = "Mission ID,Name,Date,Start Time,End Time,Duration,Type,Status,Assigned Units\n";
    
    // Get units from localStorage to map unit IDs to names
    const units = JSON.parse(localStorage.getItem('units')) || [];
    
    missions.forEach((mission, index) => {
        const missionId = `#${1138 + index}`;
        
        // Determine mission type
        let missionType = mission.type || 'reconnaissance';
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
        
        // Convert unit references to actual unit names
        let unitsText = '';
        if (mission.units && mission.units.length > 0) {
            const unitNames = mission.units.map(unitRef => {
                const unitIndex = parseInt(unitRef.replace('unit', ''), 10) - 1;
                return unitIndex >= 0 && unitIndex < units.length 
                    ? units[unitIndex].name 
                    : unitRef;
            });
            unitsText = unitNames.join('; ');
        }
        
        // Format mission data
        const formattedDate = mission.date ? formatDate(mission.date) : '';
        const duration = calculateDuration(mission.startTime, mission.endTime);
        
        // Properly escape values to handle commas in fields
        content += `${missionId},"${mission.name}",${formattedDate},${mission.startTime || ''},${mission.endTime || ''},"${duration}",${getMissionTypeName(missionType)},${mission.status},"${unitsText}"\n`;
    });
    
    // Create a blob and download
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mission_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
