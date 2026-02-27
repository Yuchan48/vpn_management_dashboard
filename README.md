# 📝 Personal VPN Management Platform

## Overview

This project is a **self-hosted VPN management platform** that allows users to securely create, manage, and monitor VPN clients through a web dashboard. It demonstrates fullstack development, network security, and DevOps skills.

**Key Features:**

- Create, list, and delete VPN clients via API
- Download WireGuard configuration files for each client
- Secure authentication using JWT
- Frontend dashboard built with React to manage clients and view stats
- Easy deployment to cloud servers or local Linux VM
- Dockerized backend and frontend for consistent deployment

---

## Tech Choice Rationale

- **Frontend:** React
  Chosen for its component-based architecture and efficient virtual DOM, which allows responsive, dynamic dashboards for managing VPN peers and monitoring connections. Unlike Next.js, server-side rendering and SEO are unnecessary for this private app, so client-side rendering keeps the architecture simple, lightweight, and easier to maintain.
  - Simplifies routing and state management
  - Reduces deployment complexity compared to hybrid SSR frameworks
  - Provides full control over UI and interactions

- **Backend:** Express.js
  Selected for its minimalism and flexibility in building RESTful APIs. While frameworks like NestJS offer additional abstractions and Fastify provides performance optimizations, Express gives transparent routing and middleware patterns that are ideal for authentication, VPN peer provisioning, and configuration management.
  - Lightweight and unopinionated
  - Clear route definitions and middleware flow
  - Easier to read and maintain for a project of this scale

- **VPN:** WireGuard
  Modern, fast, and secure VPN protocol. Runs in the Linux kernel for high performance and low latency, uses a small (~4,000 lines) and auditable codebase, and employs modern cryptography by default. Compared to OpenVPN, it is easier to automate peer provisioning via backend scripts, aligning with this project’s goal of a lightweight, maintainable VPN infrastructure.
  - Minimal codebase reduces complexity and potential bugs
  - Key-based configuration simplifies automation
  - Modern cryptography (Curve25519, ChaCha20, Poly1305) reduces misconfiguration risk

- **Authentication:** JWT
  Stateless and widely used for secure API authentication. Eliminates server-side session storage, scales easily across multiple instances, and integrates cleanly with REST APIs.
  - Supports horizontal scaling without session synchronization
  - Simplifies token-based authorization flow

- **Containerization:** Docker
  Ensures consistent runtime environments across development and production. Simplifies dependency management, streamlines cloud deployment, and supports future scalability through orchestration tools.
  - Eliminates “works on my machine” issues
  - Simplifies versioning and dependency control
  - Prepares the project for scalable deployment pipelines

### Architectural Philosophy:

This stack emphasizes simplicity, clarity, and maintainability. Each layer has a focused responsibility: React handles the UI, Express manages business logic and APIs, WireGuard secures network traffic, JWT provides stateless authentication, and Docker ensures environment consistency. Technology choices were made intentionally, balancing performance, automation, and scalability while avoiding unnecessary complexity or overengineering.

---

## Project Structure

```text
vpn-project/
├── backend/          # Express API and WireGuard integration
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── server.js
├── frontend/         # React dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   └── public/
├── docker/
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── scripts/          # WireGuard client creation scripts / automation
├── PROGRESS.md       # Future improvements & roadmap
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Node.js v20+
- npm or yarn
- WireGuard installed on Linux VM (for testing)
- Docker (optional, for deployment)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# configure environment variables
node server.js
```

### frontend

```bash
cd frontend
npm install
npm start
# Dashboard will run at http://localhost:3000
```

### Docker Deployment (Optional)

```bash
docker build -t vpn-backend ./backend
docker build -t vpn-frontend ./frontend

docker run -p 3001:3000 vpn-backend
docker run -p 3000:3000 vpn-frontend
```

---

## Usage

1. Open the React dashboard in a browser
2. Log in with your credentials
3. Add VPN clients via the “Add Client” button
4. Download the `.conf` file for each WireGuard client
5. Connect using the WireGuard client application
