# Terraflow - Backend

The core API service written in Go. It handles secure configuration delivery and acts as a gateway for the frontend.

## 🛠 Tech Stack
- **Language**: Go 1.24+
- **Framework**: [Gin Web Framework](https://github.com/gin-gonic/gin)
- **Database**: Firebase Realtime Database (via client libraries)

## ⚙️ Setup & Running

1. **Prerequisites**: Ensure Go is installed on your machine.

2. **Install Dependencies**:
   ```bash
   cd backend
   go mod download
   ```

3. **Environment Variables**:
   The backend relies on system environment variables. For local dev, you can set them in your terminal or use a `.env` manager.
   
   | Variable | Description | Default |
   |----------|-------------|---------|
   | `PORT` | Server Port | `8080` |
   | `ALLOWED_ORIGINS` | CORS Whitelist | `http://localhost:3000` |
   | `FIREBASE_API_KEY` | Firebase Config | *Required* |
   | `FIREBASE_...` | Other Firebase Configs | *Required* |

4. **Run Server**:
   ```bash
   go run main.go
   ```

## 🔌 API Endpoints

- `GET /health`: Health check.
- `GET /api/config`: Returns Firebase configuration to the frontend (requires secure CORS).
