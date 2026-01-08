# Terraflow Platform

**Terraflow Platform** is a comprehensive IoT monitoring and control system designed for water quality management (pH, Water Level) and automation (Pumps, Servos). It features a real-time web dashboard, a high-performance backend, and custom ESP32 firmware.

## 📂 Project Structure

This is a **Monorepo** containing all components of the system:

| Directory | Component | Description |
|-----------|-----------|-------------|
| **[`/frontend`](./frontend)** | **Web Dashboard** | Next.js 16, TypeScript, TailwindCSS, & Three.js visualization. |
| **[`/backend`](./backend)** | **API Server** | Go (Golang) & Gin Framework serving as the bridge and config provider. |
| **[`/firmware`](./firmware)** | **IoT Firmware** | C++ code for ESP32 microcontroller using PlatformIO. |
| **[`/deployments`](./deployments)** | **Deployment** | Docker Compose configuration for production deployment. |

## 🚀 Quick Start

### 1. Hardware Setup (IoT)
Go to **[`firmware/README.md`](./firmware/README.md)** to learn how to flash your ESP32.

### 2. Development (Localhost)
You can run the frontend and backend separately for development:
- **Backend**: `cd backend && go run main.go`
- **Frontend**: `cd frontend && npm run dev`

### 3. Production Deployment (Docker)
We use Docker Compose for easy deployment.
Go to **[`deployments/README.md`](./deployments/README.md)** for full instructions.

## 🔐 Security Note
This project uses **Environment Variables** for secrets management.
- **NEVER** commit `.env` files or `secrets.h` to GitHub.
- See individual READMEs for required variables.
