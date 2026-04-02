# 📝 Personal VPN Management Platform (Wireguard)

[Live Demo](https://wg-management-dashboard.duckdns.org) – _Demo account accessible for recruiters_

A full-stack web application for managing WireGuard VPN clients with real-time monitoring, secure authentication, and role-based access control. This project demonstrates end-to-end development skills, from backend architecture and WebSocket integration to frontend UX and deployment.

---

## Testing Demo Clients

You can test the WireGuard VPN using the demo client configuration available in the dashboard. Follow these steps to install the WireGuard app and import the configuration file:

### WireGuard App Installation

- **macOS:** Download from [WireGuard for macOS](https://www.wireguard.com/install/) and open the `.conf` file via the app. macOS may only establish handshake but might require additional routing for full internet access.
- **Windows:** Download from [WireGuard for Windows](https://www.wireguard.com/install/). Import the `.conf` file via the app interface.
- **Android:** Install from [Google Play Store](https://play.google.com/store/apps/details?id=com.wireguard.android). Tap the plus (+) button and import the `.conf` file.
- **iOS:** Install from [App Store](https://apps.apple.com/app/wireguard/id1441195209). Tap “Add a Tunnel” → “Add from File or Archive” to import the `.conf` file.

> ⚠️ Note: Demo clients are temporary and auto-deleted after 30 minutes. Re-downloading a configuration file will invalidate the previous one. If the downloaded filename is automatically appended with `(1)` or similar, rename it before importing, as special characters and filenames longer than 15 characters are not supported.

---

## 🚀 Features

### Role-Based Access

| Role           | Permissions                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Demo User**  | - View their own clients and status<br>- Create demo clients<br>- Delete clients<br>- Download client configuration (`.zip`) |
| **User**       | - All demo user permissions<br>- Change password                                                                             |
| **Admin**      | - Manage users (create/delete)<br>- View clients for all users<br>- All client operations                                    |
| **Root Admin** | - Manage admin users<br>- Cannot be deleted                                                                                  |

> **Note:** Each user can create up to **5 clients**, max **15 users** in the system.

---

### VPN Client Management

- On client creation, a `.zip` configuration file for WireGuard is downloaded automatically.
- Supported devices:
  - **macOS:** [WireGuard Desktop App](https://www.wireguard.com/install/)
  - **Windows:** [WireGuard Windows App](https://www.wireguard.com/install/)
  - **Android:** [WireGuard Android App](https://play.google.com/store/apps/details?id=com.wireguard.android)
  - **iOS:** [WireGuard iOS App](https://apps.apple.com/app/wireguard/id1441195209)
- Demo clients are temporary and **auto-removed after 30 minutes**.
- Re-downloading a config invalidates the previous one (security measure, private key not stored).

---

### Dashboard & Real-Time Updates

- Client table shows real-time VPN status (online/offline) via **Socket.IO**.
- Status updates are optimized to **emit only when changes occur**.
- Clean and responsive dashboard UI powered by **React + Nginx**.
- Demo accounts allow recruiters to explore features without affecting production data.

> ⚠️ WireGuard does not emit disconnect events; status is calculated from last handshake timestamp. Clients may show offline ~2 minutes after disconnecting.

---

## 🛠 Tech Stack

| Layer         | Technology & Purpose                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| **Frontend**  | React, Nginx for static hosting and reverse proxy                             |
| **Backend**   | Node.js, Express, Socket.IO for real-time updates, PM2 for process management |
| **VPN Layer** | WireGuard, client key management, peer synchronization                        |
| **Database**  | SQLite                                                                        |
| **Security**  | HTTP-only cookies, JWT authentication, role-based access, secure key handling |

**Why this stack?**

- **Socket.IO** enables instant client status updates without refreshing.
- **WireGuard** provides lightweight, high-performance VPN.
- **Nginx + PM2** ensures production-grade deployment and scalability.
- **JWT + HTTP-only cookies** secure session management.

---

## ⚙️ Security Considerations

- Private keys in `.conf` files are **never stored in the database**.
- Re-downloading config regenerates a new key pair for security.
- JWTs with short expiration are used for authentication.
- Role-based access control ensures data isolation per user.

---

## 🏗 Architectural Philosophy

- **Modular design:** clear separation between backend API, Socket.IO, frontend, and VPN configuration management.
- **Real-time reactive UX:** minimal polling, change detection ensures efficiency.
- **Clean deployment:** Docker/Nginx or bare-metal deployment with SSL termination.
- **Scalable & secure:** isolated rooms per user in Socket.IO, proper NAT & firewall configuration for WireGuard.

---

## 📌 Known Downsides

- Re-downloading a client config invalidates the previous one (by design, for security).
- Status updates rely on last WireGuard handshake; offline status may take ~2 minutes.
- Demo clients expire automatically and cannot be restored.

---

## 🛠 Skills Demonstrated

- Full-stack development with React and Node.js.
- Real-time communication with Socket.IO and WebSocket proxying.
- VPN configuration and integration (WireGuard).
- System-level networking and firewall management (iptables, NAT).
- Deployment and production readiness (Nginx, SSL, PM2).
- Role-based access control, JWT authentication, and secure cookie handling.
- Writing clean, maintainable code with modular architecture.
- Debugging complex connectivity and security issues.

---

## ⚠️ Advanced Deployment Notice

This project is **not a plug-and-play application**. Running it locally or on another machine requires advanced system, networking, and security knowledge. Key considerations include:

- **Operating System:** Must run on Linux (Ubuntu, Debian, etc.). Other OSes (e.g., macOS, Windows) are not fully supported due to system-level differences in VPN interfaces (macOS uses `utunX` devices, Linux uses `wg0`).
- **WireGuard Setup:** You must install and configure WireGuard manually, including `wg0.conf`, peer management, and NAT rules for packet forwarding.
- **Networking:** Proper iptables/NAT configuration is required for VPN clients to access the internet. Mac and Windows clients may establish handshake but not full routing without additional configuration.
- **Web Server:** Nginx configuration is needed for serving the frontend and proxying WebSocket connections (Socket.IO) securely.
- **Security:** SSL certificates, JWT-based authentication, and HTTP-only cookies must be correctly configured for production use.

> ⚡ **Why this matters:** Setting this up exercises skills in OS-level networking, VPN configuration, firewall rules, real-time server communication, and secure web deployment. Building and debugging this project required modifying multiple configuration files on Linux, testing network routes, and ensuring end-to-end security.

---

## 🔗 Live Demo

- [Demo Dashboard](https://wg-management-dashboard.duckdns.org) – demo account available for recruiters.
  Explore creating/deleting clients and real-time status updates.
