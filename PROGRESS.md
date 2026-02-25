# PROGRESS.md

## Project: VPN Management Dashboard

**Tech Stack:** React, WireGuard, JWT, Docker, Express.js (Node.js)

---

### Day 1 – Project Planning & Framework Selection

- Chose **React** for the frontend due to component reusability and fast development.
- Decided on **WireGuard** for VPN backend management for its simplicity and performance.
- Selected **JWT** for secure authentication between frontend and backend.
- Planned to containerize the application using **Docker** for consistent development and deployment.
- Designed high-level project architecture: frontend, backend API, VPN service management, and authentication flow.
- Created initial project structure for frontend and backend, including placeholder folders and files.

---

### Day 2 – Backend Development & SQLite Service Layer

- Configures Express, mounts `/clients` routes, applies JSON parsing and error-handling middleware, and starts the server.
- Created **middleware/error.middleware.js** – global error handler that catches and formats errors from controllers and services.
- Created `database/db.js` to connect to SQLite and initialize `vpn.db` with the `clients` table.
- Implemented **`client.service.js`** with asynchronous CRUD functions (`createClient`, `getAllClients`, `deleteClient`) using Promises, enabling future use of `async/await` in controllers.
- Implemented **routes/client.routes.js** that maps HTTP requests (`GET`, `POST`, `DELETE`) to controller functions for client management.
- Confirmed SQLite integration works and service functions return expected results during local testing.
- Added professional inline comments to explain Promises and database operations for portfolio clarity.
- **Debugging Note:** Initial testing on `localhost:5000` failed because **macOS reserves port 5000 for the system Control Center**, blocking the server from binding. Updated server to use **port 5500** and verified endpoints work using `curl` and browser.
- Learned best practices for **layered architecture**: separating services, database, and server logic.

---

## Future Improvements

- Add real-time connection statistics for each client
- Implement user roles and multi-user support
- Deploy on cloud server with automated setup using Terraform or Ansible
- Implement email notifications on new client creation

```

```
