// Simple server for handling user authentication
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve login.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// API endpoint to get users (in a real app, this would be protected)
app.get('/api/users', (req, res) => {
    try {
        const usersData = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8');
        const users = JSON.parse(usersData);
        
        // Remove passwords before sending to client
        const safeUsers = users.users.map(user => ({
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        }));
        
        res.json({ users: safeUsers });
    } catch (error) {
        console.error('Error reading users file:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login endpoint
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        const usersData = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8');
        const users = JSON.parse(usersData);
        
        const user = users.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // In a real app, you would create a session or JWT token here
            res.json({
                success: true,
                user: {
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register endpoint
app.post('/api/register', (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const usersData = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8');
        const users = JSON.parse(usersData);
        
        // Check if username already exists
        if (users.users.some(u => u.username === username)) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        
        // Create new user
        const newUser = {
            username,
            password,
            email,
            role: 'user',
            created_at: new Date().toISOString()
        };
        
        // Add to users array
        users.users.push(newUser);
        
        // Save updated users data
        fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
        
        res.status(201).json({
            success: true,
            user: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 