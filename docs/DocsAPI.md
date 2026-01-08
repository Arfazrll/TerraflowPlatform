# Terraflow Platform - API Reference

This document provides a comprehensive reference for the Terraflow Platform's interfaces. The system operates using a hybrid architecture:
1.  **HTTP REST API (Backend)**: For system configuration and health checks.
2.  **Realtime Data API (Firebase)**: For live sensor streaming and device control.

---

## 1. HTTP REST API (Backend)

The Backend service serves as the configuration provider and gateway. A typical production deployment runs this service on port `8080`.

**Base URL**: `http://localhost:8080` (or your production domain)

### Endpoints

#### `GET /health`
**Description**: Health check endpoint to verify the backend service is running.

**Response (200 OK):**
```json
{
  "status": "ok",
  "app": "terraflow-backend"
}
```

#### `GET /api/config`
**Description**: Securely delivers public Firebase configuration to the frontend application. This allows the frontend to initialize its connection to the Realtime Database.

**Response (200 OK):**
```json
{
  "firebaseConfig": {
    "apiKey": "AIzaSy...",
    "authDomain": "project.firebaseapp.com",
    "databaseURL": "https://project.firebaseio.com",
    "projectId": "project-id",
    "storageBucket": "project.appspot.com",
    "messagingSenderId": "123456789",
    "appId": "1:123456:web:abcdef"
  }
}
```

---

## 2. Realtime Data API (Firebase Schema)

The core IoT functionality relies on the **Firebase Realtime Database**. The ESP32 and Frontend strictly adhere to the following JSON path structure.

**Database URL**: Defined in your environment variables.

### A. Sensors Node (`/sensors`)
Stores live telemetry data from the ESP32.

| Path | Type | Description |
|------|------|-------------|
| `/sensors/distance.json` | `float` | Water level distance in cm. |
| `/sensors/ph.json` | `float` | Water acidity level (pH). |
| `/sensors/phVolt.json` | `float` | Raw voltage from pH sensor (for debugging). |
| `/sensors/pump.json` | `int (0/1)` | Current state of the pump (1=ON, 0=OFF). |
| `/sensors/servo2.json` | `int (0-180)` | Current angle of the servo motor. |

**Full JSON Object View:**
```json
{
  "distance": 45.2,
  "ph": 7.1,
  "phVolt": 2.3,
  "pump": 0,
  "servo2": 90
}
```

### B. Device Status Node (`/device`)
Tracks the connectivity and operational mode of the microcontroller.

| Path | Type | Description |
|------|------|-------------|
| `/device/status.json` | `int` | `1` indicates online/connected. |
| `/device/mode.json` | `string` | `"auto"` (System controls logic) or `"manual"` (User controls logic). |
| `/device/timestamp.json` | `int` | Last activity timestamp (millis from ESP32 boot). |

### C. Commands Node (`/commands`)
Used to send manual control instructions from the Web Dashboard. These are only effective when `/device/mode` is set to `"manual"`.

| Path | Type | Description |
|------|------|-------------|
| `/commands/pump.json` | `int` | Set `1` to force Pump ON, `0` for OFF. |
| `/commands/servo2.json`| `int` | Set angle `0-180` to force Servo position. |

---

## 3. Data Models (Golang Structs)

For developers extending the Backend, these internal Go structs represent the data schema:

**SensorData Model**
```go
type SensorData struct {
    Distance      float64 `json:"distance"`
    Ph            float64 `json:"ph"`
    PhVolt        float64 `json:"phVolt"`
    Servo         int     `json:"servo"`
    Servo2        int     `json:"servo2"`
    Pump          int     `json:"pump"`
    WaterDetected int     `json:"waterDetected"`
    Timestamp     int64   `json:"timestamp"`
}
```

**DeviceStatus Model**
```go
type DeviceStatus struct {
    Status int    `json:"status"`
    Mode   string `json:"mode"`
}
```

**CommandRequest Model**
```go
type CommandRequest struct {
    Servo int `json:"servo,omitempty"`
    Pump  int `json:"pump,omitempty"`
}
```
