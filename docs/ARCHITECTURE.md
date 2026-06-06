# 🧠 System Architecture Overview

This document explains the internal architecture of the WireGuard Management Platform, focusing on system components, data flow, networking design, and real-time communication.

It complements the README by describing **how the system works internally**, not what it does.

---

# 🏗 High-Level Architecture

The system is composed of four main layers:

```
[ React Frontend ]
        ↓
[ Nginx Reverse Proxy ]
        ↓
────────────────────────────
|   Node.js Backend API   |
|   Socket.IO Server      |
|   Auth + Business Logic |
────────────────────────────
        ↓
[ WireGuard VPN Layer ]
        ↓
[ Linux Networking Stack ]
```

---

# 🌐 Request Flow (HTTP API)

### 1. Client Request Flow

```
Browser (React)
    ↓
Nginx (/api)
    ↓
Node.js Express Backend
    ↓
SQLite Database
```

### 2. Example Flow

- User creates VPN client
- Frontend sends `POST /api/clients`
- Nginx proxies request to backend
- Backend:
  - generates WireGuard keypair
  - updates database
  - updates wg interface
  - returns response
- Frontend updates UI

---

# ⚡ Real-Time Architecture (Socket.IO)

The system uses Socket.IO for real-time updates (client creation, status changes).

```
Frontend (Socket.IO Client)
        ⇄
Nginx (WebSocket upgrade proxy)
        ⇄
Backend Socket.IO Server
```

### Key Design:

- Each authenticated user joins a **user-specific socket room**
- Events are broadcast only to relevant users
- No global polling is used

### Example Event Flow:

```
Backend → emits "client_created"
Frontend → updates UI instantly
```

---

# 🔐 Authentication Architecture

- JWT-based authentication
- Stored in HTTP-only cookies
- Role-based access control (RBAC)

```
Frontend → login
Backend → issues JWT
Browser → stores cookie
Nginx → forwards authenticated requests
Backend → validates JWT middleware
```

---

# 🔑 WireGuard Integration Layer

WireGuard is treated as a system-level service, not just a library.

### Responsibilities:

- Generate private/public key pairs
- Manage peer configurations
- Update `wg0` interface dynamically
- Maintain NAT routing rules

### Flow:

```
User Action (Create Client)
        ↓
Backend generates keypair
        ↓
Updates SQLite DB
        ↓
Executes system-level WireGuard commands
        ↓
Updates active VPN peers (wg0)
```

---

# 🌍 Networking Architecture (Linux Layer)

The system relies on Linux networking stack:

- `iptables` / NAT for traffic routing
- IP forwarding enabled (`sysctl`)
- WireGuard interface (`wg0`)
- UDP tunnel on port `51820`

### Packet Flow:

```
Client Device
    ↓ (WireGuard Tunnel)
VPS Public IP (51820 UDP)
    ↓
wg0 interface
    ↓
NAT (iptables)
    ↓
Internet
```

---

# 🔁 Deployment Architecture

### Production Stack:

```
[ React Build ]
        ↓ served by
[ Nginx static files ]
        ↓
[ Nginx reverse proxy ]
        ↓
[ Node.js (PM2) ]
        ↓
[ WireGuard system service ]
```

### Process Management:

- PM2 ensures backend uptime
- auto-restart on failure
- log monitoring via `pm2 logs`

---

# 🔌 Socket + API Separation

The system separates:

| Layer           | Responsibility                  |
| --------------- | ------------------------------- |
| REST API        | CRUD operations, authentication |
| Socket.IO       | Real-time updates               |
| WireGuard layer | System networking               |

This prevents coupling between UI updates and system state changes.

---

# 🧩 Key Design Decisions

## 1. Separation of Concerns

- Frontend = UI only
- Backend = logic + system orchestration
- WireGuard = OS-level VPN service

---

## 2. Real-Time First Design

Instead of polling:

- Socket.IO pushes updates instantly
- reduces load and improves UX

---

## 3. System-Level Integration

Unlike typical web apps, this system interacts with:

- Linux kernel networking
- WireGuard interface
- NAT rules
- system services

---

## 4. Stateless Frontend

Frontend does not manage VPN state:

- backend is single source of truth
- frontend is reactive UI layer

---

# 📊 Scalability Considerations

Current design supports:

- multiple users (RBAC isolation)
- multiple VPN clients per user
- stateless backend instances (with shared DB)
- horizontal scaling possible with Redis adapter for Socket.IO

---

# 🧠 Summary

This system combines:

- Full-stack web application
- Real-time communication system
- Linux networking + VPN orchestration
- Production deployment architecture

It demonstrates end-to-end engineering across:

- backend systems
- networking
- infrastructure
- real-time UI design
