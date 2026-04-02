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

# Day 9 – Unit Testing Services

## Summary

Added minimal unit tests for core backend services to ensure reliability and maintainability. Focused on testing `client.service.js` and `wireguard.service.js` without making actual system calls to WireGuard.

## Development Implementation

- **Client Service Tests**
  - Created `__tests__/client.service.test.js` using Jest.
  - Tested CRUD operations: `createClient`, `deleteClient`, `getClientById`, `getAllClients`, `updateClientPublicKey`.
  - Used Jest mocks to isolate database operations.
  - Verified proper handling of missing parameters and expected errors.

- **WireGuard Service Tests**
  - Created `__tests__/wireguard.service.test.js`.
  - Mocked `addPeer`, `removePeer`, and `getWireGuardPeers` to avoid executing `wg` commands.
  - Tested successful peer addition/removal and proper error handling.
  - Ensured `getWireGuardPeers()` correctly parses peer data and handles empty states.

- **Testing Strategy**
  - Focused on **bare minimum coverage** to verify functionality without relying on real WireGuard or modifying the database.
  - Allowed faster development and prevented accidental changes to live data.
  - Ensured mocks and `jest.clearAllMocks()` prevent state leakage between tests.

## Result

- Core services now have automated tests for basic functionality.
- Unit tests provide confidence for future backend changes.
- Tests run quickly and safely without requiring elevated permissions or real WireGuard interfaces.

# Day 10 – Role-Based Access & User Ownership

## Summary

Implemented role-based access and user ownership for VPN clients. Regular users can only manage their own clients, while admins retain full access. Added user management endpoints, improved authentication with JWT, and ensured client operations integrate correctly with WireGuard peer management.

## Development Implementation

- **Client Ownership**
  - Linked each client to a `user_id`.
  - Added `getClientsByUserId(userId)` service to retrieve clients by owner.
  - Implemented `GET /clients/me` endpoint to return authenticated user’s clients.
  - Updated client creation and deletion to enforce ownership rules.
  - Added database index for faster lookups:
    `CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id)`.

- **User & Admin Management**
  - Moved `createUser` logic into `user.service.js` and `user.controller.js`.
  - Added endpoints:
    - `POST /users/user` – create regular users (IDs 2–16, max 15 users).
    - `POST /users/admin` – create admin users (IDs ≥17).
  - Passwords hashed using bcrypt.

- **Authentication**
  - Implemented JWT authentication middleware.
  - `loginUser` validates credentials and returns token containing user `id` and `role`.
  - Middleware attaches authenticated user info to `req.user`.
  - Added dummy bcrypt comparison to prevent timing attacks.

- **WireGuard Integration**
  - Updated client creation to assign ownership and add peer to WireGuard.
  - `.conf` files continue to be generated dynamically with keys stored only in memory.
  - Existing peer sync logic maintained consistency between database and WireGuard interface.

- **Validation & Testing**
  - Verified `/clients/me` returns only the user’s clients.
  - Confirmed admins can access all clients and statuses.
  - Tested client creation, deletion, config download, and status endpoints with ownership enforcement.

## Issues Encountered

- Needed to refactor service logic to enforce ownership without affecting admin access.
- JWT payload required both `id` and `role` for role-based authorization.
- Adjustments were needed to ensure WireGuard peer synchronization worked with user-owned clients.

## Result

- Backend now supports multi-user VPN management with role-based access.
- Users manage their own clients, while admins have full system visibility.
- Authentication, client management, and WireGuard integration work consistently with ownership enforcement.

# Day 11 – User Profile, Password Management & Validation

## Summary

Added input validation, user profile retrieval, and secure password change. Improved database reliability with cascade deletes, added indexes, and validated environment variables. Enhances backend security, stability, and frontend usability.

## Development Implementation

- **Input Validation**
  - `utils/inputValidators.js` centralizes validation.
  - `validateUsername()` – min 3 chars, letters, numbers, `_`, `-`.
  - `validatePassword()` – min 8 chars.
  - Used in `createUser`, `createAdmin`, and `changePassword`.

- **Change Password**
  - Endpoint: `PATCH /users/me/password`.
  - Validates current password, hashes new password with bcrypt.
  - Returns success message on update.

- **Current User Endpoint**
  - `GET /users/me` returns `id`, `username`, `role`, `created_at`.
  - Enables frontend profile display and role-based UI.

- **Environment Variable Validation**
  - `utils/envValidator.js` checks required vars on startup: `JWT_SECRET`, `SERVER_PUBLIC_KEY`, `SERVER_ENDPOINT`, `DNS_SERVER`, `VPN_SUBNET_MASK`.
  - Server exits if any are missing.

- **Database Improvements**
  - Added index on `clients.public_key` for performance.
  - Cascade deletes fixed with `PRAGMA foreign_keys = ON`.

- **Testing**
  - Verified `/users/me` and `/users/me/password`.
  - Confirmed authentication, validation, and cascade deletes work correctly.

## Issues Encountered

- Enabling cascade deletes required SQLite foreign key enforcement.
- Password change logic needed careful validation.
- Missing environment variables caused startup failures without validation.

## Result

- Backend supports user profile retrieval and secure password updates.
- Input validation and environment checks improve stability.
- System is ready for frontend integration with profile, password, and role-based features.

# Day 12 – Frontend Login Page Implementation

## Summary

Implemented LoginPage in Vite + React with TailwindCSS. Integrated backend authentication, token storage, form validation, loading states, error display, and protected dashboard route. Frontend is ready for Change Password and client management.

## Development Implementation

- **Project Setup**
  - Migrated from CRA to Vite; Tailwind configured via `@import "tailwindcss";`.
  - `.env` variable `VITE_API_BASE_URL` for backend.
  - Folder structure:
    ```
    src/
      components/icons/ → EyeIcon, EyeOffIcon
      pages/            → LoginPage, Dashboard, ChangePassword
      routes/           → ProtectedRoute
      services/         → authService.js
      utils/            → auth.js, inputValidators.js
    ```

- **LoginPage.jsx**
  - Controlled inputs for username/password; toggle show/hide password.
  - Frontend validation via `inputValidators.js`.
  - Loading state disables inputs/buttons; error messages shown inline in fixed-height div.
  - Calls `authService.js` login API; stores token with `setToken`.
  - Navigates to `/dashboard` using React Router `useNavigate()`.

- **Auth & Utilities**
  - `authService.js` handles login POST `/api/auth/login` and token storage.
  - `utils/auth.js` provides `getToken`, `setToken`, `removeToken`, `isAuthenticated`.
  - `ProtectedRoute.jsx` redirects unauthenticated users to `/login`.

- **Challenges & Fixes**
  - Tailwind not compiling → fixed `index.css` import and cleared cache.
  - Eye icon not displaying → fixed JSX/className.
  - Layout shift on error → fixed-height div with non-breaking space.
  - `window.location.href` replaced by `useNavigate()`.

## Result

- Login page fully functional: validation, API, token storage, loading/error states.
- Protected dashboard route works.
- Ready for Change Password page and dashboard client management.

# Day 13 – Dashboard & UI Improvements

## Summary

Implemented responsive Dashboard layout and UI enhancements. Integrated Change Password page with consistent styling and loading spinners. Added mock data for UI testing and role-based rendering for Users vs Admins.

## Development Implementation

- **Responsive Layout**
  - Dashboard `bg-gray-100`, `min-h-screen w-full`, responsive padding: mobile `px-4`, sm `px-6`, md+ `px-10`.
  - Cards/tables centered with `max-w-5xl mx-auto`.

- **Login & Change Password Pages**
  - Responsive forms with password toggles, inline error messages, and submit button spinner (`Processing...`) when `isLoading`.
  - On password change: token removed, navigate to `/login` with message.

- **Dashboard Skeleton**
  - `<CurrentUserInfo />`, `<ChangePasswordButton />`.
  - `<ClientsTable />` – admin sees owner column; users see own clients.
  - `<UsersTable />` – admin-only.
  - Tables support loading, error states, and use mock data.
  - Role-based rendering handled with conditional JSX.
  - Periodic client status refresh planned via `useEffect` + `setInterval`.

- **Mock Data & API**
  - `users.json`, `clients.json`, `currentUser.json`.
  - `mockService.js` simulates API calls for testing layout and tables.

- **Design Decisions**
  - Clean, simple layout with responsive padding.
  - Buttons and inputs use Tailwind hover, focus, and disabled states.

## Next Steps

- Separate components into individual files.
- Implement periodic client status refresh.
- Refine role-based permissions.
- Improve table grouping, sorting, and visual polish.

# Day 14 – Dashboard Refactor & Root Admin Middleware

## Summary

Refactored Dashboard into components, added user/client creation modals, improved styling, and enforced root-admin restriction on backend.

## Development Implementation

- **Dashboard Components**
  - `<CurrentUserInfo />` – displays username, role, creation date.
  - `<ChangePasswordButton />` – navigates to `/change-password`.
  - `<LogoutButton />` – clears token and logs out.
  - `<UsersTable />` – admin-only; shows users with delete button.
  - `<ClientsTable />` – shows clients (grouped by user for admin, own clients for users); includes status badges.

- **Create Modals**
  - **CreateUserModal** in `UsersTable`:
    - Local state managed inside component.
    - Form with validation.
    - Table updates automatically on success.
  - **CreateClientModal** in `ClientsTable`:
    - Local state managed inside component.
    - Form with validation.
    - New clients appended on success.
  - Modals maintain responsive layout, loading spinner, and error handling.

- **Styling**
  - Login/Change Password pages: min-h-screen, centered, responsive padding, bg-gray-700/100.
  - Buttons show spinner + "Processing..." when `isLoading`.
  - Tables: white cards, rounded corners, shadow, overflow-x-auto for mobile.

- **Backend Root Admin Restriction**
  - `requireRootAdmin.js` middleware:
    ```js
    if (!req.user || req.user.role !== "admin")
      return res.status(401).json({ error: "Unauthorized" });
    if (req.user.id !== 1)
      return res
        .status(403)
        .json({ error: "Forbidden: Only root admin can perform this action" });
    next();
    ```
  - Applied to createAdmin route; controller now only handles validation and service call.

## Next Steps

- Replace mock service calls with real backend API requests.
- Implement create/delete endpoints with JWT auth.
- Add periodic client status refresh, table sorting, and success/error feedback.

# Day 15 – API Integration & Client Config Download

## Summary

Integrated frontend with backend APIs, refactored client status fetching, unified endpoints, and implemented `.conf` file download via blob. Enforced role-based restrictions for client/user operations.

## Development Implementation

- **Client API**
  - Unified backend `getClients` returns all clients; filtered for regular users internally.
  - Removed separate `/clients/me` and `/clients/status` routes.
  - Frontend `clientService.js` now uses:
    - `fetchClients()` – fetch all or own clients.
    - `createClient(clientData)` – create new client.
    - `deleteClient(client, user)` – only owner or admin can delete.
    - `fetchClientConfig(clientId)` – downloads `.conf` as blob via `apiFetch`.

- **API Helper**
  - `apiFetch(endpoint, options)` handles:
    - JWT token automatically.
    - JSON, text, and blob responses.
    - Non-OK response error handling.
  - Frontend downloads `.conf` using blob + temporary link for SPA behavior.

- **Role-based Security**
  - Root admin middleware (`requireRootAdmin`) enforced for createAdmin.
  - `deleteUser` and `deleteClient` match backend rules:
    - Regular users cannot delete others.
    - Admins cannot delete other admins unless root.
    - Root admin protected from deletion.

- **Dashboard Updates**
  - Tables and modals integrated with real API:
    - UsersTable: admin-only, includes `CreateUserModal`.
    - ClientsTable: grouped for admin, own clients for users, includes `CreateClientModal`.
  - Loading spinners, error handling, responsive layout maintained.

## Issues Encountered

- Backend `.conf` download automatically triggered browser download; needed frontend blob handling to keep SPA intact.
- Combined client status endpoints required backend filtering logic to avoid separate `/status` calls.
- Role-based delete logic had edge cases for root admin vs admin vs user; synchronized frontend checks with backend.

## Next Steps

- Implement periodic client status refresh in `ClientsTable`.
- Add table sorting and visual polish.
- Integrate full create/delete API calls with modals and success/error messages.

# Day 16 – Dashboard Enhancements & Data Consistency

## Summary

Refined client creation flow with `.conf` download, improved data consistency via backend JOINs, and enhanced modals, tables, and error handling.

## Development Implementation

- **Client Creation**
  - Backend returns `.conf` file.
  - Frontend downloads via Blob (`downloadFile` helper).
  - Refetch clients after creation; modal closes on success.

- **Data Consistency**
  - Backend:
    - Added `username` to clients via JOIN.
    - Sorted by `username ASC, client.id ASC`.
  - Frontend:
    - Refetch users/clients after create/delete.

- **UI Improvements**
  - Clients grouped by `username` (admin).
  - Row-level loading for delete actions.
  - Prevented conflicting actions during operations.

- **Error Handling**
  - Mapped backend errors to user-friendly messages.
  - Displayed with styled error state in UI.

- **Modals**
  - Fully local state, inline validation, and error handling.

## Issues Encountered

- `.conf` download required Blob handling in frontend.
- Missing `username` caused grouping issues → fixed with JOIN.
- Manual state updates led to inconsistencies → switched to refetching.
- Mixed API responses required robust `apiFetch`.

## Next Steps

- Replace alerts with toasts.
- Improve loading states.
- Add table sorting/filtering.

# Day 17 – Client Limits, Peer Cleanup & Config File Fixes

## Summary

Implemented per-user client limits, ensured proper WireGuard peer cleanup on user deletion, and fixed `.conf` file issues for cross-platform compatibility. Frontend input handling and modal behavior were improved. Tested the app thoroughly, fixing bugs and adding missing features encountered during usage.

## Development Implementation

- **Client Limits**
  - Backend now restricts users/admins to a maximum of 5 clients.
  - Frontend displays error when limit is reached.

- **Peer Cleanup**
  - On user deletion, associated WireGuard peers are removed automatically.
  - Added `removeOrphanedPeers.js` to clean peers without associated clients.

- **Config File Generation**
  - Removed `Name` field from `[Interface]` for Android compatibility.
  - Frontend sanitizes filenames when downloading config files to avoid invalid name errors.
  - `.conf` extension appended correctly after sanitization.

- **Frontend Improvements**
  - Reset input values when reopening "Create Client" modal.
  - Error messages for existing client names and limit exceeded are displayed properly.
  - Refined modal UX to prevent stale input data.

- **Testing & Bug Fixes**
  - Tested login, logout, user creation/deletion, password changes, client creation/deletion.
  - Fixed issues such as stale modal inputs, improper peer cleanup, and `.conf` download errors.
  - Added missing features observed during actual app usage, improving overall workflow.

## Issues Encountered

- Android WireGuard app rejected `.conf` files with invalid filenames.
- Orphaned peers persisted when deleting users without explicit peer removal.
- Stale input values in modals led to user confusion → fixed via reset on open.

## Next Steps

- Test live status updates of WireGuard peers when clients connect/disconnect.
- Refresh clients table automatically on user deletion.
- Improve responsive design, including horizontal scrolling for tables.

# Day 18 – Real-Time Updates & Mobile VPN Testing

## Summary

Implemented real-time updates for clients table, refined frontend responsiveness, and tested WireGuard VPN connectivity on a mobile device. Addressed UI/UX issues and further validated backend operations.

## Development Implementation

- **Real-Time Clients Table**
  - Added polling every 10 seconds to refresh client status.
  - Ensured state updates do not conflict with ongoing operations (delete/download).

- **Frontend Enhancements**
  - Improved mobile responsiveness for users and clients tables.
  - Tables now scroll smoothly on x-axis; column alignment maintained.
  - Download and delete buttons centered and functional across devices.
  - Toasts implemented for success/error messages.

- **VPN Testing**
  - Generated `.conf` files downloaded via frontend and imported on WireGuard mobile app.
  - Verified that VPN tunnel reaches Mac server.
  - Observed internet access blocked due to macOS security/NAT constraints; plan to test full internet access once deployed on Linux server.

- **Validation and Restrictions**
  - Client names restricted to letters, numbers, and hyphens (`-`).
  - Limit of 5 clients per user enforced.
  - Backend validations and error messages confirmed for client/user creation.

## Issues Encountered

- Mobile VPN connects to server but no internet due to macOS network/NAT rules.
- Need to maintain column alignment when downloading `.conf` while keeping table responsive.
- Ensuring real-time updates do not overwrite user interactions (modals, loading states).

# Day 19 – WebSockets Integration & Deployment Planning

## Summary

Transitioned from polling to WebSocket‑based real‑time updates, planned the Dockerization and deployment architecture, and made several backend/frontend quality improvements in preparation for containerization.

## Development Implementation

- **WebSocket Integration**
  - Added `socket.io` to backend and initialized a persistent connection from the frontend.
  - Emits client list updates to connected clients on relevant events (e.g., create/delete).
  - Integrated WebSocket event handler in React to update clients state in real time.

- **Root Admin Auto‑Creation**
  - Implemented server startup logic to check for the existence of a root admin (id = 1).
  - If missing, automatically seeds a root admin account to ensure secure administrative control.

- **Security Improvements**
  - Switched from JWT in `localStorage` to **HTTP‑only cookies** for authentication.
  - Updated client API calls to send credentials and handle session via cookies securely.

- **Environment Configuration Separation**
  - Introduced `.env.development` and `.env.production` files with environment‑specific settings.
  - Prepared secrets, API base paths, and other variables to align with future Docker and Nginx deployments.

- **Code Quality Enhancements**
  - Added a comprehensive `.dockerignore` to reduce image size and exclude sensitive/config files.
  - Cleaned up polling useEffect logic in favor of WebSocket event handling.
  - Began backend and frontend unit test improvements (particularly around client/user workflows).

- **Deployment Planning & Design**
  - Drafted containerization strategy using Docker with:
    - Backend container
    - Frontend container served through Nginx
    - Named Docker volumes for SQLite persistence and application logs
    - Backup strategy via cron or backup container performing periodic `.backup` of SQLite
    - Non‑root user execution inside containers for better security
  - Determined WireGuard should run on the host OS instead of inside Docker for proper networking and kernel access.
  - Mapped routing and reverse proxy behavior expected for Nginx to forward `/api` and WebSocket connections.

## Issues Encountered

- Client deletion sometimes did not automatically update the clients list in the UI without a page refresh — an effect that predates WebSocket migration and will be resolved in tandem with both WebSocket and backend test improvements.
- Still refining connection handling for WebSockets to recover gracefully on disconnect/reconnects.
- Need to review backend events to ensure they emit appropriate and consistent updates for all WebSocket clients.

# Day 20 – Demo User Enhancements & Periodic Cleanup

## Summary

Added full support for demo users, including auto-filled login and client creation fields, disabled password changes, and a periodic cleanup mechanism for demo clients. Updated unit tests and prepared for frontend-backend integration improvements.

## Development Implementation

- **Demo User Enhancements**
  - Added "Use Demo Account" button on login to autofill demo credentials (`demo_user` / `demo_password`).
  - Disabled change password button in frontend and rejected password change requests in backend for demo users.
  - Auto-filled client creation input for demo users with unique names using safe characters (`demo-${nanoid(8)}`) to comply with validation regex `/^[a-zA-Z0-9-]{5,}$/`.
  - Demo clients can still be created and deleted, showing full app functionality to recruiters without altering demo credentials.

- **Periodic Cleanup of Demo Clients**
  - Added `is_demo` field in the database for demo users.
  - Created `cleanupOldDemoClients()` service to remove demo clients older than 30 minutes and their associated WireGuard peers.
  - Scheduled cleanup to run every 30 minutes using `setInterval`.
  - Initial cleanup runs at server startup to prevent stale demo clients.

- **Testing & Validation**
  - Updated unit tests to cover demo client creation and cleanup logic.
  - Verified real-time updates and Socket.IO emits still work after demo client deletions.
  - Ensured demo clients are filtered correctly and backend rejects restricted operations (like changing password).

- **Frontend Integration**
  - Demo login autofill implemented for convenience during interviews.
  - Client creation modal autofill ensures demo users can easily test app functionality without conflicts or validation errors.

## Issues Encountered

- `nanoid` generated `_` character by default, which violated client name validation; fixed with custom alphabet.
- Demo client cleanup needed careful handling to remove associated WireGuard peers without affecting non-demo users.
- Ensured auto-generated demo client names remain unique to avoid collisions during multiple sessions.

# Day 21 – Production Build Testing & Nginx Configuration

## Summary

Tested the application in a production-like environment without Docker, fixed environment variable and database initialization issues, and configured Nginx for serving the frontend and proxying backend requests. Resolved Socket.IO connection issues to ensure real-time functionality works in production.

## Development Implementation

- **Production Build Testing**
  - Decided not to use Docker to avoid complications with WireGuard, which requires direct access to host networking and kernel interfaces that are difficult to manage reliably inside containers.
  - Built frontend using `npm run build` and served backend with `node server.js`.
  - Verified core functionalities including authentication, client management, and API communication.

- **Environment Variables Fix**
  - Resolved issues with missing environment variables by properly configuring `.env.production`.
  - Ensured backend correctly loads environment variables using `dotenv` with `NODE_ENV=production`.

- **Database Initialization Fix**
  - Fixed database initialization logic where tables were not being created automatically.
  - Issue caused by missing `async/await`, leading to race conditions during startup.
  - Ensured database setup completes before server starts handling requests.

- **Nginx Configuration**
  - Configured Nginx to serve frontend static files from build directory.
  - Set up reverse proxy to backend (`localhost:3000`) for API routes.
  - Added routing rules to support SPA (React) using `try_files`.

- **Socket.IO Fix**
  - Encountered connection issues with Socket.IO in production.
  - Fixed by adding proper WebSocket headers in Nginx configuration:
    - `Upgrade`
    - `Connection`
  - Verified real-time updates (client status, events) work correctly.

## Issues Encountered

- Backend failed silently due to missing environment variables.
- Database initialization did not complete due to improper async handling.
- Socket.IO failed to connect due to missing Nginx WebSocket configuration.
- Needed to carefully align frontend build paths with Nginx root configuration.

# Day 22 – Server Deployment, HTTPS Setup & Production Testing

## Summary

Deployed the application to a live Ubuntu server on Hetzner, configured networking and services (WireGuard, Nginx, SSH), connected domain via DuckDNS, and enabled HTTPS using Certbot. Conducted end-to-end testing and identified remaining issues related to file downloads, WebSocket communication, and WireGuard connectivity.

## Development Implementation

- **Server Setup (Hetzner)**
  - Provisioned Ubuntu-based VPS on Hetzner.
  - Configured SSH access and basic security settings.
  - Installed required software:
    - Node.js
    - Nginx
    - WireGuard
    - Git

- **Project Deployment**
  - Cloned project repository from GitHub.
  - Installed dependencies and built frontend (`npm run build`).
  - Started backend server using Node.js and managed processes.

- **Domain & DNS Configuration**
  - Registered domain using DuckDNS (`wg-management-dashboard.duckdns.org`).
  - Configured DNS records to point to server IPv4 and IPv6.
  - Resolved connectivity issues caused by IPv6 misconfiguration.

- **Nginx Configuration**
  - Set up Nginx to serve frontend and proxy API requests.
  - Fixed issues where frontend and backend were not properly connected due to misconfigured routes and proxy settings.
  - Verified correct routing for API and static assets.

- **HTTPS Setup**
  - Installed Certbot and generated SSL certificate.
  - Enabled HTTPS with automatic redirection from HTTP.
  - Ensured secure cookie handling and authentication over HTTPS.

- **Production Testing**
  - Tested login, logout, and CRUD operations successfully.
  - Verified frontend-backend integration works over HTTPS.

## Issues Encountered

- Nginx configuration initially incomplete, causing frontend/backend communication failure.
- IPv6 connection attempts failed, blocking access until properly configured.
- `.conf` file download on Android adds `.txt` extension due to browser limitations.
- Socket.IO (WebSocket) not transmitting data correctly in production environment.
- WireGuard clients can connect but do not have internet access, indicating missing NAT or routing configuration.

## Next Steps

- Implement `.zip` download for WireGuard config files to ensure compatibility across devices.
- Fix WebSocket (Socket.IO) configuration in Nginx for stable real-time communication.
- Debug and resolve WireGuard networking (iptables/NAT) to enable internet access for clients.

# Day 23 – Frontend Build Deployment, Zip Downloads & WebSocket Fix

## Summary

Deployed updated frontend build to production, fixed `.zip` download issues on mobile devices, and resolved Socket.IO connectivity between frontend and backend. Verified real-time client updates are reflected correctly in the dashboard table.

## Development Implementation

- **Frontend Build & Deployment**
  - Rebuilt frontend with `npm run build` to include the latest changes.
  - Copied `dist/` folder contents to Nginx root (`/usr/local/var/www/frontend`) and reloaded Nginx.
  - Verified that new build is loaded in production by adding console logs and checking Chrome DevTools.

- **Zip File Download Fix**
  - Updated client configuration download logic to wrap response in a `Blob` with type `application/zip`.
  - Ensured Android and iOS devices correctly download `.zip` files without `.json` or `.txt` extensions.
  - Confirmed backend API returns valid zip data and frontend correctly triggers file download.

- **Socket.IO / WebSocket Fix**
  - Updated backend Socket.IO server to use `path: "/api/socket.io"` matching Nginx proxy location.
  - Configured Nginx to proxy `/api/socket.io/` with proper WebSocket headers (`Upgrade`, `Connection`).
  - Updated frontend Socket.IO client to use `path: "/api/socket.io"` and `transports: ["websocket"]`.
  - Verified that creating and deleting clients triggers `clientsUpdated` events and updates the frontend client table in real time.

- **Nginx Proxy & WebSocket**
  - Reloaded Nginx after updating configuration.
  - Confirmed WebSocket handshake succeeds (`wss://` connection) in Chrome DevTools Network tab.
  - Verified correct CORS headers and credentials handling for frontend-backend communication.

## Issues Encountered

- Frontend build caching caused old version to load initially, preventing socket and download fixes from taking effect.
- Android browsers automatically appended `.json` or `.txt` to downloaded `.zip` files without proper `Blob` type.
- Initial Socket.IO connection failed due to mismatched path between frontend, backend, and Nginx proxy.

## Next Steps

- Debug WireGuard server NAT/routing rules to allow connected clients to access the internet.
- Continue testing `.zip` downloads and Socket.IO events across multiple devices and browsers.
- Monitor production server logs for any intermittent WebSocket or download issues.

# Day 24 – Backend Client Creation Refactor & Direct Zip Download

## Summary

Refactored backend client creation API to return the `.zip` configuration file directly upon client creation. Updated frontend to handle ZIP download immediately after client creation, removing the need for a separate "Download Config" button. Verified the new flow works across desktop and mobile browsers.

## Development Implementation

- **Backend Refactor**
  - Created `utils/zipGenerator.js` to handle `.zip` generation for WireGuard client configs.
  - Updated `createClient` controller to generate a new WireGuard key pair and immediately return the `.zip` file containing the `.conf`.
  - Removed the separate `/clients/:id/config` download route, simplifying backend logic.
  - Ensured private keys are never stored in the database; old configs become inactive automatically.

- **Frontend Update**
  - Updated `createClient` function to fetch `/api/clients` and handle `.zip` response directly.
  - Replaced previous `downloadConfFile` logic with immediate download after client creation.
  - Updated `CreateClientModal` to remove the "Download Config" button and handle errors and loading state correctly.
  - Verified ZIP download triggers automatically on desktop, Android, and iOS devices.

- **UX Improvements**
  - Displayed success toast immediately after client creation.
  - Error handling in modal for failed client creation is consistent with backend messages.

## Issues Encountered

- Some clients still cannot access the internet even though WireGuard handshake succeeds and IP addresses match between database, config, and `wg show`.
- Suspected potential WireGuard routing/NAT configuration issues on the server.
- Client creation and ZIP download flow is confirmed working; issue seems network-level rather than frontend/backend.

## Next Steps

- Debug WireGuard interface, NAT, and firewall rules to ensure all clients can access the internet.
- Continue testing demo and admin clients, paying attention to IP allocation and peer synchronization.
- Monitor production server logs for any anomalies during client creation or peer syncing.

# Day 25 – Deployment Completion, Real-Time Updates & Socket.IO Improvements

## Summary

Completed deployment and stabilized real-time client updates using Socket.IO with per-user data isolation. Implemented polling with change detection to ensure the dashboard reflects client status updates without requiring manual refresh. Finalized demo client lifecycle behavior and improved overall system reliability.

## Development Implementation

- **Internet Access Debugging**
  - Spent hours troubleshooting clients unable to reach the internet despite successful WireGuard handshakes.
  - Cause: residual `ufw` chains were still loaded even though UFW was disabled; also, the `wg0` IP in config mismatched the actual interface.
  - Solution: completely flushed `iptables` and rebuilt NAT and forwarding rules:
    ```bash
    sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
    sudo iptables -A FORWARD -i wg0 -o eth0 -j ACCEPT
    sudo iptables -A FORWARD -i eth0 -o wg0 -m state --state RELATED,ESTABLISHED -j ACCEPT
    ```
  - Corrected `wg0.conf` from `10.10.0.1/24` → `10.0.0.1/24`, restoring full internet connectivity for all clients.

- **Socket.IO Authentication & Isolation**
  - Implemented JWT authentication for Socket.IO using HTTP-only cookies.
  - Extracted token from cookie during handshake and verified it on connection.
  - Attached user information (`id`, `role`) to each socket instance.
  - Assigned sockets to user-specific rooms (`user_<id>`) to prevent cross-user data exposure.

- **Per-User Real-Time Updates**
  - Created `emitIoPerUser()` to emit client data per authenticated user.
  - Grouped connected sockets by user ID and emitted only relevant client data.
  - Updated `getClientsWithStatus(user)` to filter clients based on user role and ownership.

- **Polling with Change Detection**
  - Introduced 10-second polling interval in `server.js`.
  - Implemented `lastStatePerUser` to track previously emitted client state.
  - Compared current vs previous state using `JSON.stringify` to emit updates only when changes occur.
  - Ensured efficient updates without unnecessary network traffic.

- **Demo Client Lifecycle**
  - Refactored `cleanupAndReloadDemoClients()` to handle only cleanup and WireGuard sync.
  - Moved Socket.IO emit logic to `server.js` for better separation of concerns.
  - Ensured expired demo clients are removed automatically and reflected in UI in near real-time.

- **Nginx & WebSocket Fix**
  - Fixed reverse proxy configuration to support Socket.IO over HTTPS.
  - Ensured proper handling of `Upgrade` and `Connection` headers for WebSocket.
  - Resolved issue where frontend was not receiving real-time updates after HTTPS enforcement.

## Issues Encountered

- Socket.IO initially failed after Nginx reconfiguration due to missing WebSocket headers.
- Real-time updates were not triggering unless demo clients were deleted (emit tied to cleanup logic).
- Status updates for disconnected clients were delayed due to WireGuard handshake timing (~2 minutes).
- Resolved by decoupling emit logic from cleanup and introducing polling-based state reconciliation.

## Next Steps

- Perform extended testing across devices and networks to ensure stability.
- Document deployment and architecture decisions for future reference.
