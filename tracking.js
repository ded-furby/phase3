// Real-Time Tracking Functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const missionFilter = document.getElementById('mission-filter');
    const filterGoBtn = document.getElementById('filter-go');
    const trackingMap = document.getElementById('tracking-map');
    const trackingRoutes = document.getElementById('tracking-routes');
    const emptyMessage = document.getElementById('empty-message');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const refreshBtn = document.getElementById('refresh');
    
    // Sidebar navigation
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            if (buttonText === 'MISSIONS') {
                window.location.href = 'dashboard.html';
            } else if (buttonText === 'UNITS') {
                window.location.href = 'units.html';
            } else if (buttonText === 'COMMS') {
                window.location.href = 'messaging.html';
            } else if (buttonText === 'REPORTS') {
                window.location.href = 'reports.html';
            } else if (buttonText === 'SETTINGS') {
                window.location.href = 'settings.html';
            }
        });
    });
    
    // Zoom level & tracking state
    let currentZoom = 1;
    let currentMission = 'all';
    let trackingInterval = null;
    let activeMissions = [];
    
    // Initialize
    init();
    
    function init() {
        // Load missions from localStorage
        loadMissions();
        
        // Check for URL parameters to directly load a specific mission
        checkUrlParameters();
        
        // Initialize event listeners
        initEventListeners();
        
        // Show initial tracking view
        updateTrackingView();
    }
    
    function checkUrlParameters() {
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const missionId = urlParams.get('mission');
        
        // If mission parameter exists, set it as the current mission
        if (missionId !== null) {
            // Find the mission index in the dropdown
            for (let i = 0; i < missionFilter.options.length; i++) {
                if (missionFilter.options[i].value === missionId) {
                    missionFilter.selectedIndex = i;
                    currentMission = missionId;
                    break;
                }
            }
        }
    }
    
    function loadMissions() {
        // Get missions from localStorage
        const missions = JSON.parse(localStorage.getItem('missions')) || [];
        activeMissions = missions;
        
        // Clear existing options (except "All Missions")
        while (missionFilter.options.length > 1) {
            missionFilter.remove(1);
        }
        
        // Populate dropdown with mission options
        missions.forEach((mission, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = `#${1138 + index} - ${mission.name}`;
            missionFilter.appendChild(option);
        });
        
        // Show/hide empty message
        if (missions.length === 0) {
            emptyMessage.textContent = 'No missions available. Create missions to track them.';
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
        }
    }
    
    function initEventListeners() {
        // Filter GO button click
        filterGoBtn.addEventListener('click', () => {
            currentMission = missionFilter.value;
            updateTrackingView();
            
            // Update URL with the selected mission for bookmarking/sharing
            updateUrl(currentMission);
        });
        
        // Zoom controls
        zoomInBtn.addEventListener('click', () => {
            if (currentZoom < 2) {
                currentZoom += 0.2;
                applyZoom();
            }
        });
        
        zoomOutBtn.addEventListener('click', () => {
            if (currentZoom > 0.5) {
                currentZoom -= 0.2;
                applyZoom();
            }
        });
        
        // Refresh button
        refreshBtn.addEventListener('click', () => {
            // Visual feedback for refresh
            refreshBtn.classList.add('refreshing');
            setTimeout(() => {
                refreshBtn.classList.remove('refreshing');
                
                // Update tracking points
                simulateMovement();
                
                // Show success pulse animation
                refreshBtn.classList.add('success');
                setTimeout(() => {
                    refreshBtn.classList.remove('success');
                }, 1000);
            }, 500);
        });
        
        // Auto-refresh simulation
        if (trackingInterval) {
            clearInterval(trackingInterval);
        }
        trackingInterval = setInterval(simulateMovement, 5000);
    }
    
    function updateUrl(missionId) {
        // Update the URL without reloading the page
        const url = new URL(window.location.href);
        
        if (missionId === 'all') {
            url.searchParams.delete('mission');
        } else {
            url.searchParams.set('mission', missionId);
        }
        
        window.history.replaceState({}, '', url);
    }
    
    function updateTrackingView() {
        // Clear existing routes
        trackingRoutes.innerHTML = '';
        
        // If no missions, show empty message
        if (activeMissions.length === 0) {
            emptyMessage.style.display = 'block';
            return;
        }
        
        // Get selected mission(s)
        if (currentMission === 'all') {
            // Show all missions
            activeMissions.forEach((mission, index) => {
                renderMissionRoute(mission, index);
            });
            emptyMessage.style.display = 'none';
        } else {
            // Show specific mission
            const missionIndex = parseInt(currentMission);
            if (activeMissions[missionIndex]) {
                renderMissionRoute(activeMissions[missionIndex], missionIndex);
                emptyMessage.style.display = 'none';
            } else {
                emptyMessage.style.display = 'block';
                emptyMessage.textContent = 'No tracking data available for this mission';
            }
        }
        
        // Apply current zoom level
        applyZoom();
    }
    
    function renderMissionRoute(mission, index) {
        // Check if mission has route points
        if (!mission.routePoints || mission.routePoints.length === 0) return;
        
        // Create route container
        const routeElement = document.createElement('div');
        routeElement.className = 'route';
        routeElement.dataset.missionId = `#${1138 + index}`;
        
        // Generate a deterministic "current position" along the route
        // In a real app, this would come from actual tracking data
        let activePointIndex = getSimulatedActivePoint(mission, index);
        
        // Add route points and lines
        mission.routePoints.forEach((point, pointIndex) => {
            // Add point
            const pointElement = document.createElement('div');
            pointElement.className = 'route-point';
            if (pointIndex === activePointIndex) {
                pointElement.classList.add('active');
            }
            pointElement.style.left = `${point.x}%`;
            pointElement.style.top = `${point.y}%`;
            pointElement.textContent = pointIndex + 1;
            
            // Add point to route
            routeElement.appendChild(pointElement);
            
            // Add line connecting to next point
            if (pointIndex < mission.routePoints.length - 1) {
                const nextPoint = mission.routePoints[pointIndex + 1];
                
                // Create a dotted line between points for tracking
                const lineElement = document.createElement('div');
                lineElement.className = 'route-line';
                
                // Calculate line position and length
                const x1 = point.x;
                const y1 = point.y;
                const x2 = nextPoint.x;
                const y2 = nextPoint.y;
                
                // Calculate distance
                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                
                // Calculate angle
                const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
                
                // Set line styles
                lineElement.style.width = `${length}%`;
                lineElement.style.left = `${x1}%`;
                lineElement.style.top = `${y1}%`;
                lineElement.style.transform = `rotate(${angle}deg)`;
                
                // Make the line dotted
                lineElement.style.background = 'linear-gradient(90deg, rgba(100, 181, 246, 0.7) 50%, transparent 50%)';
                lineElement.style.backgroundSize = '10px 3px';
                
                // Add line to route
                routeElement.appendChild(lineElement);
            }
        });
        
        // Add route to tracking view
        trackingRoutes.appendChild(routeElement);
    }
    
    function applyZoom() {
        trackingRoutes.style.transform = `scale(${currentZoom})`;
        trackingRoutes.style.transformOrigin = 'center center';
    }
    
    function getSimulatedActivePoint(mission, missionIndex) {
        // This simulates where the current position would be on the route
        // In a real application, this would be based on actual tracking data
        
        // Use a deterministic but changing value based on time
        const timeOffset = Math.floor(Date.now() / 1000) % 60;
        const missionOffset = missionIndex * 7;
        const totalOffset = (timeOffset + missionOffset) % mission.routePoints.length;
        
        return totalOffset;
    }
    
    function simulateMovement() {
        // This simulates movement of tracking points
        // In a real app, you would fetch updated tracking data from a server
        
        // Simply re-render the current view to update "active" points
        updateTrackingView();
    }
}); 