// ESP32 + R307 fingerprint attendance device.
//
// On a successful fingerprint match, POSTs { deviceUserId } to the school app's
// /api/device-checkin route, which looks up the teacher by their Fingerprint
// Device ID (set on the teacher's Edit page) and records their arrival time.
//
// Wiring (R307 -> ESP32 DevKit):
//   VCC -> 3V3   GND -> GND   TX -> GPIO16 (RX2)   RX -> GPIO17 (TX2)
//   Optional buzzer: + -> GPIO4, - -> GND
//
// Library required (Arduino IDE > Library Manager): "Adafruit Fingerprint Sensor Library"
//
// One-time enrollment: open the Serial Monitor at 115200 baud, connected over USB, and type:
//   e 1        -> enrolls the next two finger placements as ID 1
//   d 1        -> deletes ID 1
// Use the same number as the teacher's "Fingerprint Device ID" in the app.

#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Fingerprint.h>

// ---- fill these in ----
const char *WIFI_SSID = "YOUR_WIFI_NAME";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char *API_URL = "https://your-school-app.example.com/api/device-checkin";
const char *DEVICE_SECRET = "PASTE_THE_SAME_VALUE_AS_DEVICE_SHARED_SECRET";
// ------------------------

#define RXD2 16
#define TXD2 17
#define BUZZER_PIN 4

HardwareSerial fingerSerial(2);
Adafruit_Fingerprint finger(&fingerSerial);

int lastScannedId = -1;
unsigned long lastScanMillis = 0;
const unsigned long COOLDOWN_MS = 5000;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);

  fingerSerial.begin(57600, SERIAL_8N1, RXD2, TXD2);
  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("Fingerprint sensor found.");
  } else {
    Serial.println("Fingerprint sensor NOT found — check wiring.");
    while (true) delay(1000);
  }

  connectWiFi();
  Serial.println("Ready. Place a finger to check in, or type 'e <id>' / 'd <id>' to manage enrollments.");
}

void loop() {
  handleSerialCommands();

  int id = getFingerprintMatch();
  if (id > 0) {
    bool isRepeat = (id == lastScannedId) && (millis() - lastScanMillis < COOLDOWN_MS);
    lastScannedId = id;
    lastScanMillis = millis();

    if (!isRepeat) {
      sendCheckin(id);
    }
  }

  delay(50);
}

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected, IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connection failed — will retry on next scan.");
  }
}

int getFingerprintMatch() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK) return -1;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return -1;

  p = finger.fingerFastSearch();
  if (p != FINGERPRINT_OK) {
    beep(2);
    return -1;
  }

  return finger.fingerID;
}

void sendCheckin(int deviceUserId) {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("No WiFi — check-in dropped.");
    beep(3);
    return;
  }

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-secret", DEVICE_SECRET);

  String payload = String("{\"deviceUserId\":\"") + deviceUserId + "\"}";
  int code = http.POST(payload);
  String response = http.getString();
  http.end();

  Serial.printf("Check-in ID %d -> HTTP %d: %s\n", deviceUserId, code, response.c_str());
  beep(code == 200 ? 1 : 3);
}

void beep(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(120);
    digitalWrite(BUZZER_PIN, LOW);
    delay(120);
  }
}

// ---- Serial Monitor commands: "e <id>" to enroll, "d <id>" to delete ----

void handleSerialCommands() {
  if (!Serial.available()) return;

  String line = Serial.readStringUntil('\n');
  line.trim();

  if (line.startsWith("e ")) {
    int id = line.substring(2).toInt();
    if (id > 0) enrollFingerprint(id);
  } else if (line.startsWith("d ")) {
    int id = line.substring(2).toInt();
    if (id > 0) {
      uint8_t p = finger.deleteModel(id);
      Serial.println(p == FINGERPRINT_OK ? "Deleted ID " + String(id) : "Delete failed.");
    }
  }
}

bool enrollFingerprint(int id) {
  Serial.println("Place finger to enroll as ID " + String(id) + "...");

  uint8_t p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) delay(50);
    else if (p != FINGERPRINT_OK) {
      Serial.println("Scan error, try again.");
      return false;
    }
  }

  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) {
    Serial.println("Could not process image, try again.");
    return false;
  }

  Serial.println("Remove finger.");
  delay(1500);
  p = 0;
  while (p != FINGERPRINT_NOFINGER) p = finger.getImage();

  Serial.println("Place the same finger again...");
  p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) delay(50);
  }

  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) {
    Serial.println("Could not process second image, try again.");
    return false;
  }

  p = finger.createModel();
  if (p != FINGERPRINT_OK) {
    Serial.println("Fingerprints did not match each other, try again.");
    return false;
  }

  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Enrolled ID " + String(id) + " successfully.");
    beep(1);
    return true;
  }

  Serial.println("Storage failed (ID may be out of range or in use).");
  return false;
}
