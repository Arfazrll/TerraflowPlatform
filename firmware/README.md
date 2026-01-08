# IoT Firmware (ESP32)

This directory contains the firmware for the ESP32 microcontroller used in the Terraflow system.
It uses **PlatformIO** for dependency management and building.

## Setup Instructions

1. **Install PlatformIO**:
   - Install [VS Code](https://code.visualstudio.com/).
   - Install the **PlatformIO IDE** extension for VS Code.

2. **Open the Project**:
   - Open this folder (`firmware/esp32_sensor`) in VS Code (or the root workspace).
   - PlatformIO should automatically detect the `platformio.ini` file and initialize the project.

3. **Configure Credentials**:
   - The file `src/secrets.h` contains WiFi and Firebase credentials.
   - **IMPORTANT**: Do not commit your real passwords to public GitHub repositories!
   - `src/secrets.h` is currently included in the version control for your convenience, but you should add it to `.gitignore` if you plan to make this public.

## Directory Structure

- `src/main.cpp`: Main application code.
- `src/secrets.h`: Configuration secrets (WiFi, Firebase).
- `platformio.ini`: Project configuration and dependencies.

## Dependencies

- **ESP32Servo**: Logic for servo motor control.
- **WiFi** & **HTTPClient**: Connectivity.

## Uploading

1. Connect your ESP32 via USB.
2. Click the **PlatformIO logo** on the left sidebar.
3. Under **esp32dev**, click **Upload and Monitor**.
