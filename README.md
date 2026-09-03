# 🔐 Self-Hosted WireGuard VPN Management System

### 🔑 Demo Access

🚀 [Live Demo](https://wg-management-dashboard.duckdns.org)

Use the demo account to explore:

- Create and delete VPN clients
- Generate and download WireGuard configuration files
- Monitor client status via the dashboard

> ⚠️ Note: Client connections are established using the official WireGuard app. Admin-level features are outlined in this README.

<img width="422" alt="admin dashboard" src="https://github.com/user-attachments/assets/67a29eb2-9ab0-4fab-bfa9-be9f240b5113" />
<br><br>

A self-hosted WireGuard VPN server with a custom management dashboard for provisioning and monitoring VPN clients. Built with TypeScript,React, Node.js, SQLite, and Socket.IO, and deployed on Linux with WireGuard, Nginx, and PM2.

---

## 🧪 Testing Demo Clients

Download a `.conf` file from the dashboard and import it into the official WireGuard app.

- **macOS / Windows:** Open the configuration with the WireGuard application.
- **Android / iOS:** Install the WireGuard app and import the configuration file.

> ⚠️ Demo clients are automatically deleted after 30 minutes. Re-downloading a configuration generates a new key pair and invalidates the previous configuration.

[WireGuard Installation Guide](https://www.wireguard.com/install/)

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

## 🛠 Tech Stack

| Layer              | Technology & Purpose            |
| ------------------ | ------------------------------- |
| **Frontend**       | React, TypeScript               |
| **Backend**        | Node.js, Express, Socket.IO     |
| **VPN Layer**      | WireGuard, peer synchronization |
| **Database**       | SQLite                          |
| **Testing**        | Vitest, Jest, Supertest         |
| **Infrastructure** | Linux, Nginx, PM2               |
| **Security**       | JWT, HTTP-only cookies, RBAC    |

---

## 🧪 Testing

- **Frontend:** Vitest unit and integration tests
- **Backend:** Jest unit and Supertest integration tests
- Covers authentication, authorization, validation, CRUD operations, and error handling

---

## 🔐 Security

- JWT authentication with HTTP-only cookies
- Role-based access control and user-level data isolation
- Private keys are not stored in the database
- Configuration downloads generate new key pairs
- Input validation and protected API routes
- HTTPS in production

---

## 🏗 Architecture

```text
React Frontend
↓
Nginx
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

---

## 🚀 Deployment

The application is designed to run on a Linux server with WireGuard, Nginx, and PM2.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for setup and deployment instructions.

---

## 📸 Screenshots

<img width="350"  alt="active wireguard vpn" src="https://github.com/user-attachments/assets/19dad1bb-f22b-4a07-957f-efff5e049cdb" />
<br>
<img width="350" alt="admin dashboard" src="https://github.com/user-attachments/assets/25c09e1a-817e-4c3c-a995-3a95418d4494" />
<br>
<img width="350" alt="login page" src="https://github.com/user-attachments/assets/1c7cd569-764e-4c5c-a728-8cf0f87fe7d7" />
<br>
<img width="350" alt="create user" src="https://github.com/user-attachments/assets/f6ad7eac-c590-4e0e-8d5f-638ab6ba82a2" />
<br>
<img width="350" alt="create client" src="https://github.com/user-attachments/assets/4f065f3a-e8ea-45a3-a99b-6a990b835859" />
<br>
<img width="350" alt="change password" src="https://github.com/user-attachments/assets/03357bc0-5cc0-4470-a54d-1ac41103e2d4" />
