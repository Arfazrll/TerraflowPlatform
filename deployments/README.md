# Terraflow - Deployment Guide

This directory contains the **Docker Compose** configuration to run the full software stack (Frontend + Backend) in a production environment.

## 📋 Prerequisites
- **Docker** and **Docker Compose** installed on the server/PC.

## 🔐 Configuration (Crucial Step)

Before running, you **MUST** create a `.env` file in this directory (`deployments/.env`). This file holds your secrets and is ignored by Git.

1. Create file: `deployments/.env`
2. Paste the following content and fill in your real values:

```ini
# --- Firebase Secrets (From Firebase Console) ---
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=iottubes-...
FIREBASE_DATABASE_URL=https://...
FIREBASE_PROJECT_ID=iottubes-...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

# --- Application Config ---
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000,http://your-domain.com
NEXT_PUBLIC_API_URL=http://localhost:8080 
# Note: NEXT_PUBLIC_API_URL should point to the Public IP/Domain of the backend
```

## 🚀 Running the App

Once the `.env` file is ready:

```bash
# Start services in the background
docker-compose up --build -d

# Check logs
docker-compose logs -f
```

- **Frontend**: Accessible at `http://localhost:3000`
- **Backend**: Accessible at `http://localhost:8080`

## 🛑 Stopping
```bash
docker-compose down
```
