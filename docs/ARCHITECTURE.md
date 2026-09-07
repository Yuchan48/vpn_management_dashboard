# System Architecture

This document describes the architecture, data flow, and system-level integration of the WireGuard Management Platform.

## High-Level Architecture

```text
React Frontend
      ↓
Nginx Reverse Proxy
      ↓
Node.js / Express
├── REST API
├── Socket.IO
├── Authentication / RBAC
└── SQLite
      ↓
WireGuard
      ↓
Linux Networking
```

## Request Flow

```text
Browser
  ↓
Nginx
  ↓
Express API
  ↓
Services
├── SQLite
└── WireGuard
```

For example, creating a VPN client:

1. Frontend sends `POST /api/clients`.
2. Backend validates and authorizes the request.
3. Client state is stored in SQLite.
4. WireGuard peer configuration is updated.
5. A Socket.IO event notifies connected clients.

## Authentication

JWTs are stored in HTTP-only cookies.

```text
Login
  ↓
Backend
  ↓
JWT Cookie
  ↓
Authenticated Request
  ↓
JWT + RBAC Middleware
```

The backend handles authentication and authorization. The frontend does not directly manage the JWT.

## Real-Time Communication

Socket.IO provides real-time client and status updates.

```text
Frontend
    ⇄
Nginx
    ⇄
Socket.IO Server
```

Authenticated users join user-specific rooms so events are delivered only to relevant users.

## WireGuard Integration

WireGuard is a system-level dependency managed by the backend.

The backend is responsible for:

- Managing VPN peers
- Updating peer configuration
- Synchronizing client state
- Applying interface changes

```text
User Action
    ↓
Backend Service
    ↓
SQLite + WireGuard
    ↓
Socket.IO Event
    ↓
Frontend Update
```

## Networking

Production networking uses:

- WireGuard interface: `wg0`
- UDP port: `51820`
- IP forwarding
- NAT / iptables

```text
VPN Client
    ↓
UDP 51820
    ↓
WireGuard wg0
    ↓
NAT
    ↓
Internet
```

## Production Deployment

React is built into static assets and served by Nginx. Nginx also terminates HTTPS and proxies API and WebSocket traffic to the Node.js backend.

```text
                Internet
                   ↓
                 Nginx
              ↙         ↘
     Static Frontend   /api + Socket.IO
                           ↓
                     Node.js / PM2
                           ↓
                  SQLite / WireGuard
```

## Design Principles

- **Separation of concerns:** Frontend handles UI, backend handles business logic and authorization, and WireGuard handles VPN networking.
- **Backend as source of truth:** VPN client state is managed by the backend and synchronized with WireGuard.
- **Real-time updates:** Socket.IO provides immediate state updates to connected clients.
- **System-level integration:** The backend directly interacts with the host's WireGuard and Linux networking environment.
