# PROGRESS.md

## Project: VPN Management Dashboard

**Tech Stack:** React, WireGuard, JWT, Docker, Express.js (Node.js)

---

# Day 2 – Backend Setup & Service Layer Implementation

## Summary

Implemented Express backend structure and integrated SQLite with service-based architecture.

## Implemented Components

- Configured Express server:
  - Mounted `/clients` routes
  - Applied `express.json()` middleware
  - Added global error-handling middleware
  - Started server on configurable port

- Created database layer:
  - Implemented `database/db.js`
  - Connected to SQLite
  - Initialized `vpn.db`
  - Created `clients` table

- Implemented service layer:
  - Created `client.service.js`
  - Added asynchronous CRUD functions:
    - `createClient`
    - `getAllClients`
    - `deleteClient`
  - Used Promises to support async/await in controllers

- Implemented routing layer:
  - Created `routes/client.routes.js`
  - Mapped HTTP methods (GET, POST, DELETE) to controller functions

- Implemented global error handler:
  - `middleware/error.middleware.js`
  - Centralized error formatting and response handling

## Issues Encountered

- Port 5000 conflict on macOS
  - Cause: macOS reserves port 5000 for Control Center
  - Fix: Updated server to use port 5500

## Key Learnings

- Proper middleware ordering in Express
- Separation of concerns using layered architecture
- Structuring backend projects for scalability
- Connecting SQLite with Node.js using service abstraction

## Result

- Backend architecture fully structured.
- SQLite integration functional.
- CRUD service layer ready for endpoint testing.

# Day 3 – API Testing (Express + SQLite)

## Summary

Focused on testing and validating backend CRUD functionality using Postman.

## Completed Testing

- POST /clients
  - Sent JSON body: { "name": "device1" }
  - Successfully created new client
  - Verified returned ID and stored values
- GET /clients
  - Returned correct list of clients
  - Confirmed data persisted in vpn.db
- DELETE /clients/:id
  - Successfully deleted client by ID
  - Verified deletion using subsequent GET request

## Issues Encountered

- SQLITE_CONSTRAINT: NOT NULL constraint failed: clients.name
  - Cause: Passed string instead of object to createClient()
  - Fix: Updated controller to pass object:
    createClient({ name: req.body.name })

- Database path inconsistency
  - Cause: Relative path created vpn.db in unexpected location
  - Fix: Used absolute path with \_\_dirname

## Result

- Backend CRUD flow fully functional
- Express → Controller → Service → SQLite integration verified
- Ready to proceed to next feature implementation

---

## Future Improvements

- Add real-time connection statistics for each client
- Implement user roles and multi-user support
- Deploy on cloud server with automated setup using Terraform or Ansible
- Implement email notifications on new client creation

```

```
