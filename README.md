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
  Chosen for its component-based architecture, fast UI updates, and suitability for dynamic dashboards. SEO is not a concern since this is a private app, so client-side rendering is sufficient.

- **Backend:** Express.js
  Chosen for simplicity, flexibility, and the ability to easily define RESTful APIs for user authentication, VPN management, and data handling.

This combination provides a clean separation between frontend and backend, making the project maintainable and scalable.

- **VPN:** WireGuard
  Modern, fast, and secure VPN protocol. Lightweight and easy to automate using server-side scripts.

- **Authentication:** JWT
  Stateless and widely used for secure API authentication.

- **Containerization:** Docker
  Ensures the app runs consistently across development and production environments. Simplifies deployment to cloud servers.

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
