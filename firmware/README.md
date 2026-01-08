# Terraflow - IoT Firmware (ESP32)

This directory contains the C++ firmware for the ESP32 microcontroller monitoring water quality and controlling pumps/servos.

## 🛠 Hardware & Pinout

| Component | ESP32 Pin | Logic |
|-----------|-----------|-------|
| **Ultrasonic Sensor** | Trig: `19`, Echo: `18` | Distance Measurement |
| **pH Sensor** | Analog: `35` | Water Acidity |
| **Pump Relay** | Digital: `25` | Active LOW |
| **Servo Motor** | PWM: `21` | Gate Control |
| **Buzzer** | Digital: `13` | Alarm |
| **LED Indicator** | Digital: `2` | Wi-Fi Status |

## 💻 Setup with PlatformIO

We use **PlatformIO** (VS Code Extension) for building this project. **Do not use Arduino IDE** unless you migrate the libraries manually.

1. **Install VS Code** and the **PlatformIO IDE** extension.
2. **Open Folder**: Open `terraflow/firmware/esp32_sensor` in VS Code.
3. **Configure Secrets**:
   Copy the `src/secrets.h` file (if missing, create it):
   ```cpp
   #pragma once
   const char* WIFI_SSID = "Your_WiFi_Name";
   const char* WIFI_PASSWORD = "Your_WiFi_Password";
   const char* FIREBASE_HOST = "your-project.firebaseio.com";
   ```
4. **Upload**:
   - Connect ESP32 via USB.
   - Click the **PlatformIO Alien Icon** → **Project Tasks** → **Upload and Monitor**.

## ⚠️ Safety Note
- The firmware has a fail-safe mechanism: Pump and Buzzer run for **max 2 seconds** to prevent overheating or flooding.
- Manual mode commands from the Dashboard override automatic logic.
