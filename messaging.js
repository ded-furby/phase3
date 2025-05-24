// Secure Messaging Functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const conversationItems = document.querySelectorAll('.conversation-item');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.send-btn');
    const messagesContainer = document.querySelector('.messages-container');
    const actionButtons = document.querySelectorAll('.action-btn');
    const chatTitle = document.getElementById('chat-title');
    const chatStatus = document.getElementById('chat-status');
    const archiveBtn = document.getElementById('archive-btn');
    const moreActionsBtn = document.getElementById('more-actions-btn');
    const chatList = document.querySelector('.conversations-list');
    const newChatBtn = document.querySelector('.new-chat-btn');
    
    // Store chat history for each contact - load from localStorage if available
    const chatHistory = localStorage.getItem('chatHistory') 
        ? JSON.parse(localStorage.getItem('chatHistory')) 
        : {
            'Command Operator': [
                { type: 'other', text: "What's your current position?", timestamp: '[TTM3]' },
                { type: 'self', text: "Currently at grid reference E5. Moving toward checkpoint.", timestamp: '[TTM4]' },
                { type: 'other', text: "Any obstacles or hostiles in sight?", timestamp: '[TTM5]' },
                { type: 'self', text: "Negative. Path is clear so far. Estimated arrival at checkpoint in 10 minutes.", timestamp: '[TTM6]' },
                { type: 'other', text: "Copy that. Proceed to checkpoint Alpha.", timestamp: '[TTM7]' }
            ],
            'System Manager': [
                { type: 'other', text: "System diagnostics report complete. All systems nominal.", timestamp: '[TTM12]' },
                { type: 'self', text: "Acknowledged. Any areas that need attention during next maintenance cycle?", timestamp: '[TTM13]' },
                { type: 'other', text: "Secondary radar system showing intermittent anomalies. Scheduled for inspection.", timestamp: '[TTM14]' },
                { type: 'self', text: "Understood. Priority level?", timestamp: '[TTM15]' },
                { type: 'other', text: "Medium priority. Redundant systems operational.", timestamp: '[TTM16]' }
            ],
            'Captain': [
                { type: 'other', text: "Briefing in 30 minutes. Prepare tactical overview.", timestamp: '[TTM21]' },
                { type: 'self', text: "Yes, sir. Preparing tactical overview now.", timestamp: '[TTM22]' },
                { type: 'other', text: "Include latest intel from northern sector.", timestamp: '[TTM23]' },
                { type: 'self', text: "Intel package integrated. Presentation ready for review.", timestamp: '[TTM24]' },
                { type: 'other', text: "Good work. See you at the briefing.", timestamp: '[TTM25]' }
            ],
            'Logistics Officer': [
                { type: 'other', text: "Supply convoy arriving at 0800 tomorrow.", timestamp: '[TTM31]' },
                { type: 'self', text: "Confirmed. We'll have the loading dock cleared and ready.", timestamp: '[TTM32]' },
                { type: 'other', text: "Priority items marked in manifest. Process those first.", timestamp: '[TTM33]' },
                { type: 'self', text: "Understood. Medical supplies and ammunition prioritized.", timestamp: '[TTM34]' }
            ],
            'Intelligence Analyst': [
                { type: 'other', text: "New satellite imagery available for your review.", timestamp: '[TTM41]' },
                { type: 'self', text: "Downloading now. Anything significant to note?", timestamp: '[TTM42]' },
                { type: 'other', text: "Unusual activity in sector 7. Possible asset movement.", timestamp: '[TTM43]' },
                { type: 'self', text: "I see it. Will analyze and prepare report.", timestamp: '[TTM44]' },
                { type: 'other', text: "Priority level Alpha. Command needs assessment ASAP.", timestamp: '[TTM45]' }
            ],
            'Field Commander': [
                { type: 'other', text: "Team Alpha in position at the perimeter.", timestamp: '[TTM51]' },
                { type: 'self', text: "Acknowledged. Team Bravo moving to support position.", timestamp: '[TTM52]' },
                { type: 'other', text: "Weather conditions deteriorating. Visibility reduced to 500m.", timestamp: '[TTM53]' },
                { type: 'self', text: "Understood. Switching to thermal imaging systems.", timestamp: '[TTM54]' }
            ]
        };
    
    // Track archived conversations - load from localStorage if available
    const archivedChats = localStorage.getItem('archivedChats') 
        ? JSON.parse(localStorage.getItem('archivedChats')) 
        : [];
    
    // Current active contact
    let currentContact = localStorage.getItem('currentContact') || 'Command Operator';
    let showingArchived = false;
    
    // Save data to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        localStorage.setItem('archivedChats', JSON.stringify(archivedChats));
        localStorage.setItem('currentContact', currentContact);
    }
    
    // Update action buttons based on archive status
    function updateActionButtons() {
        const isArchived = archivedChats.includes(currentContact);
        
        // Get the action buttons container
        const actionsContainer = document.querySelector('.quick-actions');
        
        // Clear existing buttons
        actionsContainer.innerHTML = '<h3>Quick Actions</h3>';
        
        // Archive/Unarchive button - only show when appropriate
        if (showingArchived && isArchived) {
            // Show unarchive button only for archived chats in archived view
            const unarchiveBtn = document.createElement('button');
            unarchiveBtn.className = 'action-btn';
            unarchiveBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M5 8h14M5 8a2 2 0 100-4h14a2 2 0 100 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M12 12v4M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
                <span>Unarchive Chat</span>
            `;
            unarchiveBtn.addEventListener('click', unarchiveCurrentChat);
            actionsContainer.appendChild(unarchiveBtn);
        } else if (!showingArchived && !isArchived) {
            // Show archive button only for active chats in normal view
            const archiveBtn = document.createElement('button');
            archiveBtn.className = 'action-btn';
            archiveBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M5 8h14M5 8a2 2 0 100-4h14a2 2 0 100 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
                <span>Archive Chat</span>
            `;
            archiveBtn.addEventListener('click', archiveCurrentChat);
            actionsContainer.appendChild(archiveBtn);
        }
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn';
        deleteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <span>Delete Conversation</span>
        `;
        deleteBtn.addEventListener('click', deleteCurrentConversation);
        actionsContainer.appendChild(deleteBtn);
        
        // View Archived/View Active button
        const viewBtn = document.createElement('button');
        viewBtn.className = 'action-btn';
        
        if (showingArchived) {
            viewBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
                <span>View Active Chats</span>
            `;
        } else {
            viewBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
                <span>View Archived</span>
            `;
        }
        
        viewBtn.addEventListener('click', toggleArchivedView);
        actionsContainer.appendChild(viewBtn);
    }
    
    // Display chat history for a contact
    function displayChatHistory(contactName) {
        // Clear the messages container
        messagesContainer.innerHTML = '';
        
        // Add date divider
        const dateDivider = document.createElement('div');
        dateDivider.className = 'message-date-divider';
        dateDivider.innerHTML = '<span>Today</span>';
        messagesContainer.appendChild(dateDivider);
        
        // Add all messages for this contact
        const messages = chatHistory[contactName] || [];
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.type}`;
            
            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${message.text}</p>
                    <span class="timestamp">${message.timestamp}</span>
                </div>
            `;
            
            messagesContainer.appendChild(messageElement);
        });
        
        // Add archived notification if chat is archived
        if (archivedChats.includes(contactName)) {
            const archivedNotice = document.createElement('div');
            archivedNotice.className = 'archived-notice';
            archivedNotice.textContent = 'This conversation is archived. Unarchive to send messages.';
            messagesContainer.appendChild(archivedNotice);
        }
        
        // Scroll to the bottom
        scrollToBottom();
    }
    
    // Enable or disable message input based on archive status
    function updateMessageInputState() {
        if (archivedChats.includes(currentContact)) {
            disableMessageInput();
        } else {
            enableMessageInput();
        }
    }
    
    // Disable message input and send button
    function disableMessageInput() {
        messageInput.disabled = true;
        messageInput.placeholder = "This conversation is archived. Unarchive to send messages.";
        messageInput.classList.add('disabled');
        sendBtn.disabled = true;
        sendBtn.classList.add('disabled');
    }
    
    // Enable message input and send button
    function enableMessageInput() {
        messageInput.disabled = false;
        messageInput.placeholder = "Type your message...";
        messageInput.classList.remove('disabled');
        sendBtn.disabled = false;
        sendBtn.classList.remove('disabled');
    }
    
    // Create new conversation items for existing chats
    function createConversationItems() {
        const conversationsList = document.querySelector('.conversations-list');
        
        // Clear existing items
        conversationsList.innerHTML = '';
        
        // Create items for all contacts in chat history
        Object.keys(chatHistory).forEach(contactName => {
            // Skip if the contact has no messages
            if (!chatHistory[contactName] || chatHistory[contactName].length === 0) {
                return;
            }
            
            // Skip contacts that don't match the current view (archived/active)
            const isArchived = archivedChats.includes(contactName);
            if ((showingArchived && !isArchived) || (!showingArchived && isArchived)) {
                return;
            }
            
            const newConversation = document.createElement('div');
            newConversation.className = 'conversation-item';
            if (contactName === currentContact) {
                newConversation.classList.add('active');
            }
            
            // Generate initials for avatar
            let initials = contactName.split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('');
            
            if (initials.length > 2) {
                initials = initials.substring(0, 2);
            }
            
            // Get last message
            const messages = chatHistory[contactName];
            const lastMessage = messages.length > 0 ? messages[messages.length - 1].text : 'New conversation started';
            
            newConversation.innerHTML = `
                <div class="avatar">
                    <span>${initials}</span>
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <h4 title="${contactName}">${contactName}</h4>
                        <span class="time">Recent</span>
                    </div>
                    <p class="last-message">${lastMessage}</p>
                </div>
            `;
            
            // Add event listener
            newConversation.addEventListener('click', function() {
                // Remove active class from all items
                document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
                
                // Add active class to this item
                this.classList.add('active');
                
                // Update current contact
                currentContact = contactName;
                saveToLocalStorage();
                
                // Update chat header title
                document.querySelector('.chat-title h3').textContent = contactName;
                
                // Update contact info panel
                document.querySelector('.info-details .value').textContent = contactName;
                
                // Display the chat history for this contact
                displayChatHistory(contactName);
                
                // Reset to normal view if we were in archived view
                if (showingArchived && !archivedChats.includes(contactName)) {
                    showingArchived = false;
                    document.querySelector('.contacts-column h3').textContent = 'Conversations';
                    updateConversationsList();
                }
                
                // Update input state based on archive status
                updateMessageInputState();
                
                // Update action buttons
                updateActionButtons();
            });
            
            // Add to the conversation list
            conversationsList.appendChild(newConversation);
        });
    }
    
    // Create a new chat with a user
    function createNewChat() {
        const contactName = prompt('Enter the name of the contact:');
        
        if (contactName && contactName.trim() !== '') {
            // Check if chat already exists
            const existingConversation = document.querySelector(`.conversation-item h4[title="${contactName}"]`);
            if (existingConversation) {
                alert('A conversation with this contact already exists.');
                return;
            }
            
            // Initialize empty chat history
            chatHistory[contactName] = [];
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Create new conversation in the left panel
            const conversationsList = document.querySelector('.conversations-list');
            const newConversation = document.createElement('div');
            newConversation.className = 'conversation-item';
            
            // Generate initials for avatar
            let initials = contactName.split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('');
            
            if (initials.length > 2) {
                initials = initials.substring(0, 2);
            }
            
            newConversation.innerHTML = `
                <div class="avatar">
                    <span>${initials}</span>
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <h4 title="${contactName}">${contactName}</h4>
                        <span class="time">Now</span>
                    </div>
                    <p class="last-message">New conversation started</p>
                </div>
            `;
            
            // Add to the beginning of the list
            conversationsList.prepend(newConversation);
            
            // Add event listener
            newConversation.addEventListener('click', function() {
                // Remove active class from all items
                document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
                
                // Add active class to this item
                this.classList.add('active');
                
                // Update current contact
                currentContact = contactName;
                saveToLocalStorage();
                
                // Update chat header title
                document.querySelector('.chat-title h3').textContent = contactName;
                
                // Update contact info panel
                document.querySelector('.info-details .value').textContent = contactName;
                
                // Display the chat history for this contact
                displayChatHistory(contactName);
                
                // Reset to normal view if we were in archived view
                if (showingArchived) {
                    showingArchived = false;
                    document.querySelector('.contacts-column h3').textContent = 'Conversations';
                    updateConversationsList();
                }
                
                // Enable message input
                enableMessageInput();
                
                // Update action buttons
                updateActionButtons();
                
                // Update contact avatar
                updateContactAvatar();
            });
            
            // Trigger a click to select this conversation
            newConversation.click();
        }
    }
    
    // Sidebar navigation
    const sidebarButtons = document.querySelectorAll('.nav-item');
    sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            if (buttonText === 'MISSIONS') {
                window.location.href = 'dashboard.html';
            } else if (buttonText === 'TRACKING') {
                window.location.href = 'tracking.html';
            } else if (buttonText === 'UNITS') {
                 window.location.href = 'units.html';
            } else if (buttonText === 'SETTINGS') {
                 window.location.href = 'settings.html';
            } else if (buttonText === 'COMMS') {
                 window.location.href = 'messaging.html';
            } else if (buttonText === 'REPORTS') {
                 window.location.href = 'reports.html';
            }
        });
    });
    
    // Search functionality
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') return;
        
        // Filter conversations based on search term
        const items = document.querySelectorAll('.conversation-item');
        items.forEach(item => {
            const contactName = item.querySelector('h4').textContent.toLowerCase();
            const lastMessage = item.querySelector('.last-message').textContent.toLowerCase();
            
            if (contactName.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Reset search on input clear
    searchInput.addEventListener('input', () => {
        if (searchInput.value === '') {
            const items = document.querySelectorAll('.conversation-item');
            items.forEach(item => {
                const contactName = item.querySelector('h4').textContent;
                const isArchived = archivedChats.includes(contactName);
                
                if ((showingArchived && isArchived) || (!showingArchived && !isArchived)) {
                item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    });
    
    // Send message functionality
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Archive current chat
    function archiveCurrentChat() {
        const confirmed = confirm(`Are you sure you want to archive the conversation with ${currentContact}?`);
        
        if (confirmed && !archivedChats.includes(currentContact)) {
            // Add to archived list
            archivedChats.push(currentContact);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update the UI to reflect the archived status
            alert(`Conversation with ${currentContact} has been archived.`);
            
            // Update action buttons
            updateActionButtons();
            
            // Disable message input
            disableMessageInput();
            
            // Add archived notification to the chat
            displayChatHistory(currentContact);
            
            // Regenerate conversation items to reflect the new archive status
            createConversationItems();
            
            // If we're not in the archived view, we need to find another conversation
            if (!showingArchived) {
                // Select another conversation if available
                const availableConversations = Array.from(document.querySelectorAll('.conversation-item'))
                    .filter(item => !archivedChats.includes(item.querySelector('h4').textContent))
                    .filter(item => item.style.display !== 'none');
                
                if (availableConversations.length > 0) {
                    availableConversations[0].click();
                } else {
                    // Clear the chat area if no conversations are available
                    messagesContainer.innerHTML = '<div class="no-messages">No active conversations.</div>';
                }
            }
        }
    }
    
    // Unarchive current chat
    function unarchiveCurrentChat() {
        const confirmed = confirm(`Do you want to unarchive the conversation with ${currentContact}?`);
        
        if (confirmed) {
            // Remove from archived list
            const index = archivedChats.indexOf(currentContact);
            if (index !== -1) {
                archivedChats.splice(index, 1);
                
                // Save to localStorage
                saveToLocalStorage();
            }
            
            // Update the UI
            alert(`Conversation with ${currentContact} has been unarchived.`);
            
            // Update action buttons
            updateActionButtons();
            
            // Enable message input
            enableMessageInput();
            
            // Refresh chat view
            displayChatHistory(currentContact);
            
            // Regenerate conversation items to reflect the new archive status
            createConversationItems();
            
            // If we're in the archived view, we need to find another archived conversation
            if (showingArchived) {
                // If there are no more archived chats, go back to normal view
                if (archivedChats.length === 0) {
                    showingArchived = false;
                    document.querySelector('.contacts-column h3').textContent = 'Conversations';
                    createConversationItems(); // Update the conversation list for the new view
                }
                
                // Select another archived conversation if available
                const availableArchivedConversations = Array.from(document.querySelectorAll('.conversation-item'))
                    .filter(item => archivedChats.includes(item.querySelector('h4').textContent))
                    .filter(item => item.style.display !== 'none');
                
                if (availableArchivedConversations.length > 0) {
                    availableArchivedConversations[0].click();
                } else if (!showingArchived) {
                    // If we switched to normal view, select the first available conversation
                    const availableConversations = Array.from(document.querySelectorAll('.conversation-item'))
                        .filter(item => !archivedChats.includes(item.querySelector('h4').textContent))
                        .filter(item => item.style.display !== 'none');
                    
                    if (availableConversations.length > 0) {
                        availableConversations[0].click();
                    }
                }
            }
        }
    }
    
    // Delete current conversation
    function deleteCurrentConversation() {
        const confirmed = confirm(`Are you sure you want to delete the conversation with ${currentContact}? This cannot be undone.`);
        
        if (confirmed) {
            // Remove from chat history
            delete chatHistory[currentContact];
            
            // Remove from archived list if it was archived
            const archivedIndex = archivedChats.indexOf(currentContact);
            if (archivedIndex !== -1) {
                archivedChats.splice(archivedIndex, 1);
            }
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update the UI
            alert(`Conversation with ${currentContact} has been deleted.`);
            
            // Regenerate conversation items to reflect the deletion
            createConversationItems();
            
            // Select another conversation based on current view
            if (showingArchived) {
                const availableArchivedConversations = Array.from(document.querySelectorAll('.conversation-item'))
                    .filter(item => archivedChats.includes(item.querySelector('h4').textContent))
                    .filter(item => item.style.display !== 'none');
                
                if (availableArchivedConversations.length > 0) {
                    availableArchivedConversations[0].click();
                } else {
                    showingArchived = false;
                    document.querySelector('.contacts-column h3').textContent = 'Conversations';
                    createConversationItems(); // Refresh conversation list for the new view
                    
                    const availableConversations = Array.from(document.querySelectorAll('.conversation-item'))
                        .filter(item => !archivedChats.includes(item.querySelector('h4').textContent))
                        .filter(item => item.style.display !== 'none');
                    
                    if (availableConversations.length > 0) {
                        availableConversations[0].click();
                    } else {
                        // Clear the chat area if no conversations are available
                        messagesContainer.innerHTML = '<div class="no-messages">No conversations available.</div>';
                        currentContact = '';
                        updateActionButtons();
                    }
                }
            } else {
                const availableConversations = Array.from(document.querySelectorAll('.conversation-item'))
                    .filter(item => !archivedChats.includes(item.querySelector('h4').textContent))
                    .filter(item => item.style.display !== 'none');
                
                if (availableConversations.length > 0) {
                    availableConversations[0].click();
                } else {
                    // Clear the chat area if no conversations are available
                    messagesContainer.innerHTML = '<div class="no-messages">No conversations available.</div>';
                    currentContact = '';
                    updateActionButtons();
                }
            }
        }
    }
    
    // Toggle between normal and archived views
    function toggleArchivedView() {
        showingArchived = !showingArchived;
        
        // Update title
        const conversationsTitle = document.querySelector('.contacts-column h3');
        
        conversationsTitle.textContent = showingArchived ? 'Archived Conversations' : 'Conversations';
        
        // Force regenerate all conversation items to ensure proper filtering
        createConversationItems();
        
        // Update action buttons to reflect the current view
        updateActionButtons();
        
        // Update the conversation list
        updateConversationsList();
        
        // Select first conversation in the view if available
        if (showingArchived) {
            const firstArchivedConversation = Array.from(document.querySelectorAll('.conversation-item'))
                .filter(item => archivedChats.includes(item.querySelector('h4').textContent))
                .filter(item => item.style.display !== 'none')[0];
            
            if (firstArchivedConversation) {
                firstArchivedConversation.click();
            } else {
                // No archived conversations
                messagesContainer.innerHTML = '<div class="no-messages">No archived conversations.</div>';
                currentContact = '';
                updateActionButtons();
            }
        } else {
            const firstActiveConversation = Array.from(document.querySelectorAll('.conversation-item'))
                .filter(item => !archivedChats.includes(item.querySelector('h4').textContent))
                .filter(item => item.style.display !== 'none')[0];
            
            if (firstActiveConversation) {
                firstActiveConversation.click();
            }
        }
    }
    
    // Update the conversations list based on current view
    function updateConversationsList() {
        // Get all conversation items
        const items = document.querySelectorAll('.conversation-item');
        
        // Hide/show based on archived status
        items.forEach(item => {
            const contactName = item.querySelector('h4').textContent;
            const isArchived = archivedChats.includes(contactName);
            
            if ((showingArchived && isArchived) || (!showingArchived && !isArchived)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Helper function to scroll to the bottom of the messages
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Initialize
    function initialize() {
        // Set up initial view state
        showingArchived = false;
        
        // Create conversation items for stored chats
        createConversationItems();
        
        // Add event listener to New Chat button
        if (newChatBtn) {
            newChatBtn.addEventListener('click', createNewChat);
        }
        
        // Initial display of the default contact's chat history
        if (currentContact) {
            displayChatHistory(currentContact);
            
            // Update UI for the current contact
            const chatTitleElement = document.querySelector('.chat-title h3');
            if (chatTitleElement) {
                chatTitleElement.textContent = currentContact;
            }
            
            // Update contact info in the right panel
            const infoValue = document.querySelector('.info-details .value');
            if (infoValue) {
                infoValue.textContent = currentContact;
            }
            
            // Find and activate the conversation item for the current contact
            const currentItem = Array.from(document.querySelectorAll('.conversation-item'))
                .find(item => item.querySelector('h4').textContent === currentContact);
            
            if (currentItem) {
                currentItem.classList.add('active');
            }
        }
        
        // Update contact avatar in the right panel
        updateContactAvatar();
        
        // Add event listeners to send button and message input
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Add event listeners for sidebar navigation
        const sidebarButtons = document.querySelectorAll('.nav-item');
        sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
                const buttonText = button.textContent.trim();
                if (buttonText === 'MISSIONS') {
                    window.location.href = 'dashboard.html';
                } else if (buttonText === 'TRACKING') {
                    window.location.href = 'tracking.html';
                } else if (buttonText === 'UNITS') {
                    window.location.href = 'units.html';
                } else if (buttonText === 'SETTINGS') {
                    window.location.href = 'settings.html';
                } else if (buttonText === 'COMMS') {
                    window.location.href = 'messaging.html';
                } else if (buttonText === 'REPORTS') {
                    window.location.href = 'reports.html';
                }
            });
        });
        
        // Add event listener for search button
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm === '') return;
            
            // Filter conversations based on search term
            const items = document.querySelectorAll('.conversation-item');
            items.forEach(item => {
                const contactName = item.querySelector('h4').textContent.toLowerCase();
                const lastMessage = item.querySelector('.last-message').textContent.toLowerCase();
                
                if (contactName.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        
        // Reset search on input clear
        searchInput.addEventListener('input', () => {
            if (searchInput.value === '') {
                updateConversationsList();
            }
        });
        
        // Update action buttons
        updateActionButtons();
        
        // Check if the current chat is archived
        updateMessageInputState();
    }
    
    // Helper function to update the contact avatar in the right panel
    function updateContactAvatar() {
        const largeAvatar = document.querySelector('.large-avatar');
        if (!largeAvatar) return;
        
        if (currentContact) {
            // Generate initials
            let initials = currentContact.split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('');
            
            if (initials.length > 2) {
                initials = initials.substring(0, 2);
            }
            
            largeAvatar.innerHTML = `<span>${initials}</span>`;
            
            // Also update the contact name in the info panel
            const contactNameValue = document.querySelector('.info-details .value');
            if (contactNameValue) {
                contactNameValue.textContent = currentContact;
            }
        } else {
            largeAvatar.innerHTML = `<span>?</span>`;
        }
    }
    
    // Helper function to send a message
    function sendMessage() {
        const messageText = messageInput.value.trim();
        
        if (messageText === '' || archivedChats.includes(currentContact)) return;
        
        // Generate a timestamp code (TTM + random number for demonstration)
        const timestamp = `[TTM${Math.floor(Math.random() * 90) + 10}]`;
        
        // Add to chat history
        if (!chatHistory[currentContact]) {
            chatHistory[currentContact] = [];
        }
        
        chatHistory[currentContact].push({
            type: 'self',
            text: messageText,
            timestamp: timestamp
        });
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Create a new message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message self';
        
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${messageText}</p>
                <span class="timestamp">${timestamp}</span>
            </div>
        `;
        
        // Add the message to the container
        messagesContainer.appendChild(messageElement);
        
        // Clear the input
        messageInput.value = '';
        
        // Scroll to the bottom
        scrollToBottom();
        
        // Update the last message in the conversation list
        updateLastMessage(currentContact, messageText);
        
        // Add automated response after a short delay
        setTimeout(() => {
            addAutomatedResponse(currentContact);
        }, 1000);
    }
    
    // Helper function to update the last message shown in the conversation list
    function updateLastMessage(contactName, text) {
        const conversation = Array.from(document.querySelectorAll('.conversation-item'))
            .find(item => item.querySelector('h4').textContent === contactName);
        
        if (conversation) {
            const lastMessageElement = conversation.querySelector('.last-message');
            if (lastMessageElement) {
                lastMessageElement.textContent = text;
            }
        }
    }
    
    // Default responses by contact
    const defaultResponses = {
        'Command Operator': [
            'Acknowledged. Continue with the mission.',
            'Copy that. Keep me updated on any developments.',
            'Roger. Maintain radio silence until next checkpoint.',
            'Understood. Sending backup to your location.',
            'Proceed as instructed. Over.'
        ],
        'System Manager': [
            'Copy that. All systems nominal.',
            'Roger. We\'ll schedule the inspection.',
            'Acknowledged. We\'ll prioritize the areas.',
            'Understood. We\'ll monitor the situation.',
            'Confirmed. We\'ll keep you updated.'
        ],
        'Captain': [
            'Copy that. Preparing tactical overview now.',
            'Roger. We\'ll include the latest intel.',
            'Acknowledged. We\'ll prepare the presentation.',
            'Understood. We\'ll review the briefing.',
            'Confirmed. We\'ll be ready for the briefing.'
        ],
        'Logistics Officer': [
            'Confirmed. We\'ll clear the loading dock.',
            'Roger. We\'ll prioritize the supplies.',
            'Acknowledged. We\'ll process the manifest.',
            'Understood. We\'ll prioritize medical supplies.',
            'Confirmed. We\'ll ensure the supplies are ready.'
        ],
        'Intelligence Analyst': [
            'Copy that. We\'ll analyze the satellite imagery.',
            'Roger. We\'ll prepare the report.',
            'Acknowledged. We\'ll prioritize the analysis.',
            'Understood. We\'ll prioritize the assessment.',
            'Confirmed. We\'ll analyze the information.'
        ],
        'Field Commander': [
            'Copy that. Team Bravo moving to support position.',
            'Roger. We\'ll monitor the weather.',
            'Acknowledged. We\'ll switch to thermal imaging.',
            'Understood. We\'ll adjust our strategy.',
            'Confirmed. We\'ll implement the new strategy.'
        ]
    };
    
    // Helper function to add an automated response
    function addAutomatedResponse(contactName) {
        // Get responses for this contact or use a generic response if none available
        const responses = defaultResponses[contactName] || [
            'Message received.',
            'Acknowledged.',
            'Copy that.',
            'Roger.',
            'Understood.'
        ];
        
        // Pick a random response
        const responseText = responses[Math.floor(Math.random() * responses.length)];
        
        // Generate a timestamp code (TTM + random number for demonstration)
        const timestamp = `[TTM${Math.floor(Math.random() * 90) + 10}]`;
        
        // Add to chat history
        chatHistory[contactName].push({
            type: 'other',
            text: responseText,
            timestamp: timestamp
        });
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Create a new message element for the automated response
        const responseElement = document.createElement('div');
        responseElement.className = 'message other';
        
        responseElement.innerHTML = `
            <div class="message-content">
                <p>${responseText}</p>
                <span class="timestamp">${timestamp}</span>
            </div>
        `;
        
        // Add the response to the container
        messagesContainer.appendChild(responseElement);
        
        // Update the last message in the conversation list
        updateLastMessage(contactName, responseText);
        
        // Scroll to the bottom
    scrollToBottom();
    }
    
    // Start the application
    initialize();
}); 