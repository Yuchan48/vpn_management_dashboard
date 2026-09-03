# System Architecture

This document describes the internal architecture, data flow,
networking, and system-level integration of the WireGuard Management Platform.

## High-Level Architecture

[ React Frontend ]
↓
[ Nginx Reverse Proxy ]
↓
[ Node.js / Express Backend ]
├── REST API
├── Socket.IO
├── Authentication / RBAC
└── SQLite
↓
[ WireGuard ]
↓
[ Linux Networking Stack ]

## Request Flow

Browser
↓
Nginx
↓
Express API
↓
Services
├── SQLite
└── WireGuard

For example, when creating a VPN client:

1. Frontend sends `POST /api/clients`.
2. Backend validates and authorizes the request.
3. Client data is stored in SQLite.
4. WireGuard peer configuration is updated.
5. Backend emits a Socket.IO event.
6. Connected clients update their UI.

## Authentication

Authentication uses JWTs stored in HTTP-only cookies.

Browser
↓
Login
↓
Backend
↓
JWT cookie
↓
Authenticated API requests
↓
JWT + RBAC middleware

The backend is responsible for authentication and authorization;
the frontend does not store or manage the JWT directly.

## Real-Time Communication

Socket.IO is used for real-time client and status updates.

Frontend
⇄
Nginx
⇄
Socket.IO Server

Authenticated users join user-specific rooms, allowing events to
be delivered only to the relevant users.

## WireGuard Integration

WireGuard is integrated as a system-level dependency rather than
being treated as part of the web application.

The backend manages:

- WireGuard peers
- Peer configuration
- VPN client state synchronization
- Interface updates
- Network configuration

Example:

User action
↓
Backend service
↓
SQLite + WireGuard
↓
Socket.IO event
↓
Frontend update

The application therefore depends on the underlying Linux networking
environment for VPN operation.

## Networking

Production networking uses:

- WireGuard interface: `wg0`
- UDP port: `51820`
- IP forwarding
- NAT/iptables

Packet flow:

VPN Client
↓
UDP 51820
↓
WireGuard `wg0`
↓
NAT
↓
Internet

## Production Deployment

React is built as static assets and served by Nginx.

                    Internet
                       ↓
                    Nginx
                  ↙       ↘
          Static Frontend   `/api` + Socket.IO
                              ↓
                         Node.js / PM2
                              ↓
                     SQLite / WireGuard

Nginx also handles the HTTPS endpoint and proxies API and
WebSocket traffic to the backend.

## Design Decisions

### Separation of Concerns

- **Frontend:** UI and client-side interaction
- **Backend:** business logic, authentication, and orchestration
- **WireGuard:** VPN and system-level networking

### Backend as Source of Truth

The backend manages VPN client state and synchronizes it with
the WireGuard interface. The frontend reflects this state rather
than managing the VPN directly.

### Real-Time Updates

Socket.IO is used instead of relying solely on polling for
state changes, providing immediate UI updates.

### System-Level Integration

Unlike a typical CRUD application, the backend interacts directly
with the host's WireGuard and networking environment.

## Summary

The architecture combines a React frontend, Node.js backend,
real-time communication, SQLite persistence, and system-level
WireGuard integration behind an Nginx reverse proxy.
