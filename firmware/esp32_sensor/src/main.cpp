#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino.h>
#include <ESP32Servo.h> 
#include "secrets.h"

// --- PIN DEFINITIONS ---
#define TRIG_PIN       19
#define ECHO_PIN       18
#define BUZZER_PIN     13
#define LED_PIN         2
#define SERVO2_PIN     21
#define PUMP_PIN       25
#define PH_SENSOR_PIN  35

// --- TIMING VARIABLES ---
const unsigned long READ_INTERVAL = 2500;
unsigned long lastReadTime = 0;
unsigned long lastFirebaseCheck = 0;
const unsigned long FIREBASE_CHECK_INTERVAL = 2000;

// --- SENSOR VARIABLES ---
int sensorErrorCount = 0;
const int MAX_SENSOR_ERRORS = 5;
float lastValidDistance = 100.0;
float calibration_value = 20.80 - 5.05;
unsigned long int avgval;
int buffer_arr[10], temp;

// --- SERVO OBJECT ---
Servo myServo; 
int currentServo2Angle = -1;

// --- PUMP LOGIC VARIABLES ---
unsigned long pumpStartTime = 0;
bool pumpRunning = false;
bool pumpHasRun = false; // Kunci Pompa

// --- BUZZER LOGIC VARIABLES (BARU) ---
unsigned long buzzerStartTime = 0;
bool buzzerActive = false;
bool buzzerHasRun = false; // Kunci Buzzer

// --- MANUAL MODE & FIREBASE STATE ---
bool manualMode = false;
int manualServo2Angle = -1;
bool manualPumpState = false;
float lastSentDistance = -999;
float lastSentPh = -999;
int lastSentServo = -999;
int lastSentPump = -999;

// --- PROTOTYPES ---
float measureDistance();
float readPH(float &outVolt);
void setServo2Angle(int angle);
void controlSystemLogic(float distance); // Fungsi kontrol gabungan
void sendToFirebase(float distance, float ph, float volt);
void checkFirebaseCommands();
bool sendHTTP(String path, String value, int retries = 2);
String getHTTP(String path);
void reconnectWiFi();

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n=====================================");
  Serial.println("ESP32 TERRAFLOW MONITORING v3.1");
  Serial.println("FEATURE: One-Shot Pump & One-Shot Buzzer");
  Serial.println("=====================================");

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);

  // Default States
  digitalWrite(PUMP_PIN, HIGH); // Relay Active LOW (HIGH = OFF)
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Servo Setup
  myServo.setPeriodHertz(50);    
  myServo.attach(SERVO2_PIN);    
  setServo2Angle(90); 

  // WiFi Setup
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("."); delay(500);
  }
  Serial.println("\nConnected!");
  digitalWrite(LED_PIN, HIGH);
  
  if (WiFi.status() == WL_CONNECTED) {
      sendHTTP("/device/status.json", "1", 2);
      sendHTTP("/device/mode.json", "\"auto\"", 2);
  }
}

void loop() {
  unsigned long now = millis();

  if (WiFi.status() != WL_CONNECTED) reconnectWiFi();

  // --- 1. TIMER POMPA (Auto OFF 2 detik) ---
  if (pumpRunning && (now - pumpStartTime >= 2000)) {
    digitalWrite(PUMP_PIN, HIGH); // OFF
    pumpRunning = false;
    pumpHasRun = true; // KUNCI POMPA
    Serial.println("Pump: OFF (Locked)");
    if (WiFi.status() == WL_CONNECTED) sendHTTP("/sensors/pump.json", "0", 1);
  }

  // --- 2. TIMER BUZZER (Auto OFF 2 detik) ---
  if (buzzerActive && (now - buzzerStartTime >= 2000)) {
    digitalWrite(BUZZER_PIN, LOW); // OFF (Silent)
    // Atau noTone(BUZZER_PIN) jika pakai passive buzzer
    buzzerActive = false;
    buzzerHasRun = true; // KUNCI BUZZER
    Serial.println("Buzzer: OFF (Locked)");
  }

  // --- 3. LOGIKA SENSOR & KONTROL ---
  if (now - lastReadTime >= READ_INTERVAL) {
    lastReadTime = now;
    float distance = measureDistance();

    // Error handling
    if (distance <= 0) {
      sensorErrorCount++;
      if (sensorErrorCount >= MAX_SENSOR_ERRORS) distance = 0; 
      else return; 
    } else {
      sensorErrorCount = 0;
      lastValidDistance = distance;
    }

    float phVolt;
    float phValue = readPH(phVolt);

    // Debug Print
    Serial.printf("Level: %.1f cm | pH: %.2f | Servo: %d | Pump: %s | Buzzer: %s\n", 
                  distance, phValue, currentServo2Angle, 
                  pumpHasRun ? "LOCKED" : "READY", 
                  buzzerHasRun ? "LOCKED" : "READY");

    if (WiFi.status() == WL_CONNECTED) sendToFirebase(distance, phValue, phVolt);

    if (!manualMode) {
      controlSystemLogic(distance);
    } else {
      // Manual Mode Logic
      if (manualServo2Angle >= 0 && currentServo2Angle != manualServo2Angle) {
        setServo2Angle(manualServo2Angle);
        if(WiFi.status() == WL_CONNECTED) sendHTTP("/sensors/servo2.json", String(manualServo2Angle), 1);
      }
      if (manualPumpState && !pumpRunning) {
        digitalWrite(PUMP_PIN, LOW);
        pumpRunning = true;
        pumpStartTime = millis();
        if(WiFi.status() == WL_CONNECTED) sendHTTP("/sensors/pump.json", "1", 1);
      }
    }
  }

  if (WiFi.status() == WL_CONNECTED && now - lastFirebaseCheck >= FIREBASE_CHECK_INTERVAL) {
    lastFirebaseCheck = now;
    checkFirebaseCommands();
  }
}

// --- LOGIKA UTAMA (GABUNGAN) ---
void controlSystemLogic(float distance) {
  
  // === KONDISI AMAN (> 5cm) ===
  if (distance > 5.0) {
    
    // 1. RESET KUNCI POMPA
    if (pumpHasRun) {
      pumpHasRun = false;
      Serial.println("System RESET: Pump Ready");
    }

    // 2. RESET KUNCI BUZZER
    if (buzzerHasRun) {
      buzzerHasRun = false;
      Serial.println("System RESET: Buzzer Ready");
    }
    // Pastikan buzzer mati jika air tiba-tiba naik sebelum 2 detik
    if (buzzerActive) {
        digitalWrite(BUZZER_PIN, LOW);
        buzzerActive = false;
    }

    // 3. SERVO BUKA
    if (currentServo2Angle != 0) {
      setServo2Angle(0);
      if(WiFi.status() == WL_CONNECTED) sendHTTP("/sensors/servo2.json", "90", 1);
    }
  } 
  
  // === KONDISI KRITIS (<= 5cm) ===
  else {
    
    // 1. SERVO TUTUP
    if (currentServo2Angle != 90) {
      setServo2Angle(90);
      if(WiFi.status() == WL_CONNECTED) sendHTTP("/sensors/servo2.json", "0", 1);
    }

    // 2. POMPA ON (ONE-SHOT)
    if (!pumpRunning && !pumpHasRun) {
      Serial.println("ACTION: Pump ON");
      digitalWrite(PUMP_PIN, LOW);
      pumpRunning = true;
      pumpStartTime = millis();
      if(WiFi.status() == WL_CONNECTED) sendHTTP("/sensors/pump.json", "1", 1);
    }

    // 3. BUZZER ON (ONE-SHOT)
    if (!buzzerActive && !buzzerHasRun) {
      Serial.println("ACTION: Buzzer ON");
      // Jika Buzzer Aktif (bunyi saat dikasi tegangan):
      digitalWrite(BUZZER_PIN, HIGH); 
      // Jika Buzzer Pasif (perlu nada), ganti baris atas dengan: tone(BUZZER_PIN, 2000);
      
      buzzerActive = true;
      buzzerStartTime = millis();
    }
  }
}

// --- HELPER FUNCTIONS ---

void setServo2Angle(int angle) {
  angle = constrain(angle, 0, 180);
  myServo.write(angle);
  currentServo2Angle = angle;
}

float measureDistance() {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 25000);
  if (duration == 0) return -1;
  return duration * 0.0343f / 2.0f;
}

float readPH(float &outVolt) {
  long sum = 0;
  for(int i=0; i<10; i++) { sum += analogRead(PH_SENSOR_PIN); delay(10); }
  float volt = (sum / 10.0f / 4095.0f) * 3.3f;
  outVolt = volt;
  return -5.70f * volt + calibration_value;
}

void sendToFirebase(float distance, float ph, float volt) {
  if (abs(distance - lastSentDistance) > 0.5) {
    if(sendHTTP("/sensors/distance.json", String(distance, 1))) lastSentDistance = distance;
    delay(20);
  }
  if (abs(ph - lastSentPh) > 0.05) {
    if(sendHTTP("/sensors/ph.json", String(ph, 2))) lastSentPh = ph;
    delay(20);
    sendHTTP("/sensors/phVolt.json", String(volt, 3));
  }
  sendHTTP("/device/timestamp.json", String(millis()));
}

void checkFirebaseCommands() {
  String mode = getHTTP("/device/mode.json");
  if (mode.indexOf("manual") >= 0) manualMode = true;
  else manualMode = false;

  if (manualMode) {
    String servoCmd = getHTTP("/commands/servo2.json");
    if (servoCmd != "") manualServo2Angle = servoCmd.toInt();
    String pumpCmd = getHTTP("/commands/pump.json");
    if (pumpCmd != "") manualPumpState = (pumpCmd.toInt() == 1);
  }
}

bool sendHTTP(String path, String value, int retries) {
  if (WiFi.status() != WL_CONNECTED) return false;
  HTTPClient http; http.setTimeout(1000);
  http.begin(String(FIREBASE_HOST) + path);
  int code = http.PUT(value); http.end();
  return (code == 200);
}

String getHTTP(String path) {
  if (WiFi.status() != WL_CONNECTED) return "";
  HTTPClient http; http.setTimeout(1000);
  http.begin(String(FIREBASE_HOST) + path);
  int code = http.GET();
  String payload = (code == 200) ? http.getString() : "";
  http.end();
  return payload;
}

void reconnectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.disconnect(); WiFi.begin(WIFI_SSID, WIFI_PASSWORD); delay(1000);
}
