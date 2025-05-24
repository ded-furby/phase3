# Chicken Jockey Coordination System (CJCS)

This is a UI prototype built to demonstrate mission planning and coordination based on Human-Computer Interaction principles. The system now includes functional user authentication with login and signup capabilities.

## 🔁 How to Use

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```
   or for development with auto-restart:
   ```
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000/login.html
   ```

4. Login with the default credentials:
   - Username: admin
   - Password: admin123
   
   Or create a new account using the "Sign up" link.

5. Once logged in, you'll be taken to the **main dashboard**, where you can:
   - View missions by status (Active, Calendar, Archives)
   - Track unit positions on the map
   - Resolve scheduling conflicts via the "Resolve Conflicts" tab

## Authentication System

The system now includes:
- Login functionality with credential verification
- New user registration
- User data storage in a JSON file
- Session management using browser's sessionStorage

### Direct Authentication (No Server Required)

If you encounter issues with the server:

1. Use the "Login Directly (No Server)" button on the login page
2. Use the "Register Directly (No Server)" button on the signup page

These options use the browser's localStorage to store user credentials, allowing you to test the system without a running server.

## Demo Video

[Watch Demo on Google Drive](https://drive.google.com/file/d/1VlZ8GbbsexCfgOn5sArPC-IM59MCjb-1/view?usp=sharing)

---

*Note: This prototype represents the intended flow and structure of the system. In a production environment, additional security measures would be implemented.*
