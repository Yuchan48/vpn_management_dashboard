# PROGRESS.md

## Project: VPN Management Dashboard

**Tech Stack:** React, WireGuard, JWT, Docker, Express.js (Node.js)

---

# Day 1 – Project Planning & Architecture Design

## Summary

Defined project scope, selected technology stack, and designed initial system architecture.

## Decisions Made

- Selected React for frontend development to leverage component-based architecture.
- Chose WireGuard as the VPN engine due to simplicity, performance, and modern cryptography.
- Selected JWT for secure authentication between frontend and backend.
- Decided to use Docker for containerized development and deployment.
- Chose SQLite for lightweight local database during initial development.

## Architecture Planning

- Designed high-level system structure:
  - Frontend (React)
  - Backend API (Express)
  - VPN management layer (WireGuard integration)
  - Authentication flow (JWT-based)
- Defined layered backend structure:
  - Routes
  - Controllers
  - Services
  - Database layer
- Created initial folder structure for frontend and backend projects.

## Result

- Clear technical direction established.
- Project structure initialized.
- Development environment ready for backend implementation.

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

# Day 4 – WireGuard Key Generation Strategy

## Summary

Implemented development-safe strategy for WireGuard key generation, balancing macOS testing with future Linux deployment.

## Development Implementation

- Created `utils/wireguard.js` with `generateKeyPair()` function
- Private key: generated as random 32-byte value in Node.js
- Public key: derived from private key using placeholder (first 32 bytes) for testing purposes
- Integration:
  - Updated `createClient()` in `client.service.js` to automatically generate keys for new clients
  - Tested POST /clients endpoint using Postman/curl
  - Example response:
    ```json
    {
      "id": 1,
      "name": "device1",
      "public_key": "4yWGRknVIYobdZUv4wOETaVH/oiQzbyq",
      "private_key": "4yWGRknVIYobdZUv4wOETaVH/oiQzbyqo77PKCYmN3Y=",
      "ip_address": null
    }
    ```

## Deployment Considerations

- On Linux server:
  - Real WireGuard keys will be generated using CLI commands (`wg genkey | wg pubkey`) or Curve25519 derivation in Node.js
  - Keys will be stored securely in SQLite and used to configure VPN peers
- Placeholder approach allows safe testing of API, database, and frontend **without requiring WireGuard CLI or system network changes**

## Issues Encountered

- Concern about public key derivation:
  - Public key depends on private key; initial placeholder method (`slice(0,32)`) is only for dev/testing
  - Real derivation will use proper cryptography during deployment

## Result

- Backend can now generate VPN client keys safely in development
- POST /clients endpoint tested successfully and returns key values
- API, database, and service integration fully functional
- Ready to integrate IP allocation and complete the full client creation workflow

# Day 5 – Unique IP Allocation for VPN Clients

## Summary

Implemented automated IP allocation for each new VPN client to ensure unique addresses within the subnet and verified multi-client handling.

## Development Implementation

- Created `utils/ipAllocator.js` with `getNextAvailableIp(clients)` function
  - Scans existing client IPs
  - Returns the next available IP in `10.0.0.X` subnet
  - Starts from `.2` (server reserved as `.1`)
- Updated `createClient` workflow in `client.controller.js`
  - Calls `getAllClients()` to get current clients
  - Uses `getNextAvailableIp()` to assign the next free IP
  - Passes the IP to the service function along with `name` and generated public key
- `.conf` generation now includes the assigned IP in `[Interface] Address` field
- Tested POST /clients in Postman and curl
  - Each new client receives a unique IP
  - `.conf` file downloads correctly with the assigned IP
- Verified multi-client workflow:
  - Created multiple clients sequentially → each got a unique IP
  - Deleted a client → IP was freed
  - Created a new client → assigned **smallest available IP**, confirming IP re-use works

## Issues Encountered

- None critical; function handles IP exhaustion by throwing an error if subnet is full
- Verified IPs are correctly incremented and no duplicates occur

## Result

- Client creation workflow fully integrates:
  - Public key generation (in-memory for security)
  - Unique IP allocation with re-use of freed IPs
  - `.conf` file generation for each client
- Backend ready to handle multiple clients reliably
- Next step: config file enhancements, frontend dashboard, or authentication integration

# Day 6 – Authentication & Security

## Summary

Implemented JWT-based authentication for the backend, including secure password storage and mitigation against timing attacks.

## Development Implementation

- Added `users` table to SQLite to store admin credentials securely.
- Created `scripts/createAdmin.js` to seed initial admin user with hashed password.
- Installed and used `bcrypt` for password hashing and comparison.
- Implemented `auth.repository.js` and `user.repository.js`:
  - `findUserByUsername(username)` returns a user row from the database as a Promise.
- Added `auth.service.js`:
  - Business logic for login moved here from controller
  - Handles validation, password comparison, timing attack mitigation, and JWT token generation.
  - JWT payload includes `{ sub: user.id }` for scalability and consistent identification.
- Updated `auth.controller.js`:
  - Calls `loginUser()` from service
  - Returns JWT token as JSON response.
- Mitigated timing attacks by comparing password with a dummy hash even if user does not exist.

## Issues Encountered

- Callback hell avoided by using Promise-based repository functions and `async/await`.
- Ensured that bcrypt password comparison is always performed to prevent leaking username existence via timing.

## Result

- Backend now supports secure login with JWT authentication.
- Passwords are hashed in the database, and timing attacks are mitigated.
- Code refactored for clear separation of concerns:
  - Repository handles DB queries
  - Service handles business logic
  - Controller handles HTTP request/response
- Ready to implement **authentication middleware** to protect sensitive endpoints and client creation workflow.

# Day 7 – WireGuard Runtime Integration & Startup Sync

## Summary

Integrated real WireGuard peer management into the backend and implemented a startup synchronization mechanism to ensure VPN clients stored in the database are restored to the WireGuard interface when the server starts.

## Development Implementation

- Replaced mock key generation with real WireGuard CLI commands:
  - `wg genkey` generates the private key
  - `wg pubkey` derives the public key
- Updated `utils/wireguard.js` to generate real WireGuard key pairs using the system `wg` command.
- Created `wireguard.service.js`:
  - `addPeer(publicKey, ipAddress)` adds a peer to the `wg0` interface.
  - `removePeer(publicKey)` removes a peer from the interface.
  - Used `execFileSync` instead of `execSync` to avoid shell injection vulnerabilities.
- Integrated WireGuard peer management into the client lifecycle:
  - When a client is created, the peer is immediately added to the WireGuard interface.
  - When a client is deleted, the peer is removed from the interface.
- Added error handling to maintain consistency:
  - If adding a peer fails during client creation, the client record is removed from the database to prevent orphaned entries.
- Created `wireguardSync.service.js`:
  - Implements `syncWireGuardPeers()` to restore all database clients as peers in WireGuard.
  - Iterates through stored clients and re-adds them to the running WireGuard configuration.
- Integrated startup synchronization into `server.js`:
  - `syncWireGuardPeers()` runs when the server starts to rebuild the WireGuard runtime state.

## Issues Encountered

- Avoided using `Array.forEach()` with async operations because it does not await Promises properly.
- Replaced it with `for...of` loops to ensure sequential peer synchronization.
- Ensured that errors from WireGuard CLI commands are caught and logged to prevent server crashes.

## Result

- Backend now manages WireGuard peers directly via the system `wg` interface.
- Clients created through the API are automatically activated on the VPN server.
- Implemented startup synchronization to rebuild the WireGuard runtime configuration from the database after server restarts.
- Improved reliability and security of peer management by using safe process execution and structured error handling.
- Ready to implement **`GET /clients/:id/config`** to allow clients to re-download their configuration files.

# Day 8 – WireGuard Peer Management & Client Status

## Summary

Implemented WireGuard peer management features, including client creation with dynamic configuration, deletion, and real-time status monitoring. Added automatic peer synchronization to maintain consistency between the database and the WireGuard interface.

## Development Implementation

- **WireGuard Peer Sync**
  - Created `services/wireguardSync.service.js` with `syncWireGuardPeers()` to synchronize peers on server startup.
  - Refactored `addPeer()` and `removePeer()` in `wireguard.service.js` to use `sudo` and dynamic interface from `process.env.WG_INTERFACE`.
  - Ensured peers are correctly added/removed on client creation and deletion.

- **Client Configuration Endpoint**
  - Implemented `GET /clients/:id/config` in `client.controller.js`.
  - Generates new WireGuard key pair in memory.
  - Updates client public key in the database and WireGuard interface.
  - Returns a downloadable `.conf` file with the updated configuration.

- **Client Status Endpoints**
  - `GET /clients/:id/status` – returns individual client’s connection status.
  - `GET /clients/status` – returns all clients with connection status.
  - Determined online/offline status using:
    - WireGuard `latestHandshake` timestamp
    - Endpoint state (`off` or active)
  - Shared logic for calculating status to avoid code duplication.

- **Controller & Service Enhancements**
  - Added `clientService.updateClientPublicKey()` for key rotation.
  - Ensured all client operations are reflected in both database and WireGuard interface.
  - Centralized error handling and consistent HTTP responses.

- **Key Migration**
  - Migrated existing client keys using `scripts/migrateKeys.js`.
  - Verified new keys work with WireGuard peers.
  - Private keys never persisted in the database; only stored in memory temporarily for `.conf` download.

- **Testing & Validation**
  - Successfully tested all endpoints using Postman:
    - Create, delete, retrieve config, list clients, get individual and all client statuses.
  - Verified that WireGuard peer sync works on server startup, after client creation, and after deletion.
  - Ensured proper permission handling and `sudo` usage for WireGuard commands on macOS (`utun` interface).

## Issues Encountered

- Initial permission errors when modifying WireGuard interface (`Permission denied`) on macOS.
- Confusion between `wg0` and `utun` interface names; solved using `WG_INTERFACE` environment variable.
- Parsing `wg show` output required careful handling of handshake timestamps and endpoint status.
- Needed to refactor controller functions to unify module exports style (`module.exports`) and avoid redundant code.

## Result

- Backend fully supports dynamic WireGuard peer management.
- Clients can be created, deleted, and monitored in real-time.
- WireGuard configuration stays consistent with the database.
- Ready for frontend integration to provide a full admin interface for client management.

---

## Future Improvements

- Add real-time connection statistics for each client
- Implement user roles and multi-user support
- Deploy on cloud server with automated setup using Terraform or Ansible
- Implement email notifications on new client creation

```

```
