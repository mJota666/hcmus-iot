#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h> 
#include <WiFiManager.h>

#include "SharpGP2Y10.h"
#include <TimeLib.h>
#include <Adafruit_NeoPixel.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>
#include <WiFiUdp.h>
#include <PubSubClient.h>
#include <NTPClient.h>
#include <DS1302.h>


/* DEFINE PIN*/
  /* LIGHT'S PIN DEFINE */
  #define LIGHT_PIN 4
  #define TOGGLE_LIGHT_PIN 15
  #define NUMPIXELS 8
  Adafruit_NeoPixel pixels(NUMPIXELS, LIGHT_PIN, NEO_GRB + NEO_KHZ800);
  /* FAN'S PIN DEFINE */
  #define TOGGLE_FAN_PIN 39
  #define CHANGE_FAN_MODE_PIN 13
  #define LM_CONTROL_FAN_SPEED_PIN 16
  #define LM_TOGGLE_FAN_PIN 17

  /* INTPUT SENSOR */
  /* DHT11 */
  #define DHT11_PIN 26
  DHT dht(DHT11_PIN, DHT11);
  /* MQ135 */
  #define MQ135_PIN 36
  /* GP2Y1010AU0F */
  #define GP2Y_PIN 32
  #define GP2Y_LED_PIN 33
  SharpGP2Y10 dustSensor(GP2Y_PIN, GP2Y_LED_PIN);
  /* DS1302 */

  /* OUTPUT DEVICE */
  /* LCD */
  #define CHANGE_LCD_MODE_PIN 34
  LiquidCrystal_I2C lcd(0x27, 16, 2);
  /* LED */
  #define G_PIN 27
  #define Y_PIN 14
  #define R_PIN 12
  

/* GLOBAL VARIABLE */
  /* LIGHT'S GLOBAL VARIABLE */
  int lightMode = 0;
  int prevLightStatus = LOW;
  int lightBrightnessMode_1 = 100;
  int lightBrightnessMode_2 = 60;
  int lightBrightnessMode_3 = 20;
  int r = 255;
  int g = 255;
  int b = 255;
  /* FAN'S GLOBAL VARIABLE */
  int fanMode = 0;
  bool toggleFanStatus = false;
  int prevFanStatusMode = LOW;
  int prevFanStatus = LOW;
  /* When in Dangerous mode, can not chagne fan mode or toggle fan */
  bool interfereFan_AirQuality = true;
  /* Turn time structure */
  struct TurnTime {
    unsigned long start_date;  
    unsigned long end_date;   
    String start_time;        
    String end_time;           
    int mode;                  
  };
  TurnTime turnTime;


  /* INTPUT SENSOR GLOBAL VARIABLE */
  /* DHT11 */
  float temperature = 0;
  float humidity = 0;
  /* MQ135 */
  float gasDetect = 0;
  /* GP2Y1010AUOF */
  float dustDensity = 0;

  /* OUTPUT DEVICE GLOBAL VARIABLE */
  /* LCD */
  int currentLCDMillis = 0;
  int prevLCDStatus = LOW;
  int lcdMode = 0;
  bool forceLCD = false;

  /* DATE AND TIME */
  time_t currentEpochTime = 0;
  int currentHour = 0;
  int currentMinute = 0;
  int currentSecond = 0;
  int currentDay = 0;
  int currentMonth = 0;
  int currentYear = 0;
  String currentDow = "";
  String currentTimeString = "";
  String currentDateString = "";

/* Setup WiFi & MQTT & TIME */
  /* WiFi Credential */
  const char* WIFI_SSID = "Graden 572/2 Lau 3";
  const char* WIFI_PASSWORD = "nhinlentrannha";

  /* MQTT Server */
  const char* MQTT_SERVER = "broker.mqtt-dashboard.com";
  const int MQTT_PORT = 1883;

  /* MQTT TOPIC */
  /* SUBSCRIBE */
    /* CONTROL AND UPDATE LIGHT */
    /* UPDATE LIGHT MODE FROM WEB */
  const char* MQTT_TOPIC_SUB_UPDATE_LIGHT_BRIGHTNESS_MODE = "22127270/light/update/brightness/mode";
    /* UPDATE LIGHT COLOR FROM WEB */
  const char* MQTT_TOPIC_SUB_UPDATE_LIGHT_COLOR = "22127270/light/update/color";
    /* CONTROL LIGHT FROM WEB*/
  const char* MQTT_TOPIC_SUB_CONTROL_LIGHT = "22127270/light/control";

    /* CONTROL AND UPDATE FAN */ 
    /* CONTROL FAN FROM WEB*/
  const char* MQTT_TOPIC_SUB_CONTROL_TOGGLE_FAN = "22127060/fan/control/toggle";
  const char* MQTT_TOPIC_SUB_CONTROL_CHANGE_FANMODE = "22127060/fan/control/change/fanmode";
    /* UPDATE TIME TURN ON FAN FROM WEB */
  const char* MQTT_TOPIC_SUB_SET_FAN_TURN_TIME = "22127060/fan/set/turntime";


  /* PUBLISH */
  const char* MQTT_TOPIC_PUB_SENSOR_DATA = "22127060/sensor/data";
  int currentPublishMillis = 0;

  WiFiClient espClient;
  PubSubClient client(espClient);

  WiFiUDP udp;
  NTPClient timeClient(udp, "pool.ntp.org", 7 * 3600, 60000); // UTC+7 for Vietnam


void setupWiFi() {
  delay(10);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.println(topic);

  // Convert payload to a string
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Message: ");
  Serial.println(message);

  // Parse JSON
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);
  if (error) {
    Serial.print("Failed to parse JSON: ");
    Serial.println(error.c_str());
    return;
  }

  // Update Value
  const char* title = doc["title"];

  if (strcmp(title, "toggle_light") == 0) {
    controlLightBrightnessFromWeb(doc);
  } else if (strcmp(title, "update_brightness_mode") == 0) {
    updateLightBrightnessModeFromWeb(doc);
  } else if (strcmp(title, "update_color") == 0) {
    updateLightColorFromWeb(doc);
  } else if (strcmp(title, "toggle_fan") == 0) {
    toggleFanFromWeb(doc);
  } else if (strcmp(title, "change_fanmode") == 0) {
    changeFanModeFromWeb(doc);
  } else if (strcmp(title, "set_turntime") == 0) {
    setFanTurnTime(doc);
  }
}
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("Connected to MQTT broker!");
      /* CONTROL AND UPDATE LIGHT */
      client.subscribe(MQTT_TOPIC_SUB_UPDATE_LIGHT_BRIGHTNESS_MODE);
      Serial.print("Subscribed to topic: ");
      Serial.println(MQTT_TOPIC_SUB_UPDATE_LIGHT_BRIGHTNESS_MODE);

      client.subscribe(MQTT_TOPIC_SUB_UPDATE_LIGHT_COLOR);
      Serial.print("Subscribed to topic: ");
      Serial.println(MQTT_TOPIC_SUB_UPDATE_LIGHT_COLOR);

      client.subscribe(MQTT_TOPIC_SUB_CONTROL_LIGHT);
      Serial.print("Subscribed to topic: ");
      Serial.println(MQTT_TOPIC_SUB_CONTROL_LIGHT);
      /* CONTROL AND UPDATE FAN */
      client.subscribe(MQTT_TOPIC_SUB_CONTROL_TOGGLE_FAN);
      Serial.print("Subscribed to topic: ");
      Serial.println(MQTT_TOPIC_SUB_CONTROL_TOGGLE_FAN);

      client.subscribe(MQTT_TOPIC_SUB_CONTROL_CHANGE_FANMODE);
      Serial.print("Subscribed to topic: ");
      Serial.println(MQTT_TOPIC_SUB_CONTROL_CHANGE_FANMODE);

      client.subscribe(MQTT_TOPIC_SUB_SET_FAN_TURN_TIME);
      Serial.print("Subscribed to topic: ");
      Serial.println(MQTT_TOPIC_SUB_SET_FAN_TURN_TIME);
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}
void publish(int delayPublishTime) {
  if (millis() - currentPublishMillis > delayPublishTime) {
    StaticJsonDocument<200> doc;
    doc["MQ135"] = gasDetect;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["dustDensity"] = dustDensity;
    // Serialize JSON to string
    char jsonBuffer[512];
    serializeJson(doc, jsonBuffer);

    if (client.publish(MQTT_TOPIC_PUB_SENSOR_DATA, jsonBuffer)) {
      // Serial.println("Data published successfully!");
    } else {
      // Serial.println("Data publish failed!");
    }
    currentPublishMillis = millis();
  }
}

/* DEVICE CONTROLLER*/
/* LIGHT */ 
void setLightBrightness(uint8_t brightness) {
  pixels.setBrightness(brightness);
}
void changeLightBrightnessMode(uint8_t lightMode) {
  if (lightMode == 1) {
    setLightBrightness(lightBrightnessMode_1 * 2.55);
  } else if (lightMode == 2) {
    setLightBrightness(lightBrightnessMode_2 * 2.55);
  } else if (lightMode == 3) {
    setLightBrightness(lightBrightnessMode_3 * 2.55);
  } else {
    setLightBrightness(0);
  }
}
void controlLightBrightness() {
  int currLightStatus = digitalRead(TOGGLE_LIGHT_PIN);
  if (currLightStatus != prevLightStatus) {
    if (currLightStatus == HIGH) {
      lightMode++;
      if (lightMode > 3) {
        lightMode = 0;
      }
      changeLightBrightnessMode(lightMode);
    }
    prevLightStatus = currLightStatus;
  }
}
void controlLightBrightnessFromWeb(StaticJsonDocument<200> doc) {
  const char* SlightStatus = doc["value"]["lightStatus"];
  const char* SlightMode = doc["value"]["lightMode"];
  int mode = atoi(SlightMode);

  Serial.print("Light Status: ");
  Serial.println(SlightStatus);
  Serial.print("Light Mode: ");
  Serial.println(mode);

  if (strcmp(SlightStatus, "ON") == 0) {
    lightMode = mode;
    changeLightBrightnessMode(lightMode);
  } else if (strcmp(SlightStatus, "OFF") == 0) {
    lightMode = 0;
    changeLightBrightnessMode(lightMode);
  }
}
void updateLightBrightnessModeFromWeb(StaticJsonDocument<200> doc) {
  // Assign values to variables
  lightBrightnessMode_1 = doc["value"]["lightBrightnessMode_1"].as<int>();
  lightBrightnessMode_2 = doc["value"]["lightBrightnessMode_2"].as<int>();
  lightBrightnessMode_3 = doc["value"]["lightBrightnessMode_3"].as<int>();
  // Print values
  Serial.print("New Mode 1 Brightness: ");
  Serial.println(lightBrightnessMode_1);
  Serial.print("New Mode 2 Brightness: ");
  Serial.println(lightBrightnessMode_2);
  Serial.print("New Mode 3 Brightness: ");
  Serial.println(lightBrightnessMode_3);
  changeLightBrightnessMode(lightMode);
}
void setLightColor() {
  for (int i = 0; i < NUMPIXELS; i++) { 
    pixels.setPixelColor(i, pixels.Color(r, g, b));
  }
  pixels.show();
}
void updateLightColorFromWeb(StaticJsonDocument<200> doc) {
  const char* red = doc["value"]["r"];
  const char* green = doc["value"]["g"];
  const char* blue = doc["value"]["b"];
  r = atoi(red);
  g = atoi(green);
  b = atoi(blue);
  Serial.print("Red: ");
  Serial.println(r);
  Serial.print("Green: ");
  Serial.println(g);
  Serial.print("Blue: ");
  Serial.println(b);
}
void controlLight() {
  setLightColor();
  controlLightBrightness();
}
void resetLight() {
  lightMode = 0;
  prevLightStatus = LOW;
  lightBrightnessMode_1 = 100;
  lightBrightnessMode_2 = 50;
  lightBrightnessMode_3 = 20;
  r = 255;
  g = 255;
  b = 255;
}
/* FAN */
void fanMode1() {
  analogWrite(LM_CONTROL_FAN_SPEED_PIN, 150);
  digitalWrite(G_PIN, HIGH);
  digitalWrite(Y_PIN, LOW);
  digitalWrite(R_PIN, LOW);
}
void fanMode2() {
  analogWrite(LM_CONTROL_FAN_SPEED_PIN, 200);
  digitalWrite(G_PIN, LOW);
  digitalWrite(Y_PIN, HIGH);
  digitalWrite(R_PIN, LOW);
}
void fanMode3() {
  analogWrite(LM_CONTROL_FAN_SPEED_PIN, 255);
  digitalWrite(G_PIN, LOW);
  digitalWrite(Y_PIN, LOW);
  digitalWrite(R_PIN, HIGH);
}
void fanModeOff() {
  analogWrite(LM_CONTROL_FAN_SPEED_PIN, 0);
  digitalWrite(G_PIN, LOW);
  digitalWrite(Y_PIN, LOW);
  digitalWrite(R_PIN, LOW);
}
void controlFanMode() {
  digitalWrite(LM_TOGGLE_FAN_PIN, HIGH);
  if (fanMode == 1 || fanMode == 0) {
    fanMode1();
  } else if(fanMode == 2) {
    fanMode2();
  } else {
    fanMode3();
  }
}
void changeFanMode() {
  if (toggleFanStatus) {
    controlFanMode();
    int currentFanStatusMode = digitalRead(CHANGE_FAN_MODE_PIN);
    if (currentFanStatusMode != prevFanStatusMode) {
      if (currentFanStatusMode == HIGH) {
        fanMode++;
        if (fanMode > 3) {
          fanMode = 1;
        }
      }
      prevFanStatusMode = currentFanStatusMode;
    }
  } else  {
    fanModeOff();
  }
}
void toggleFan() {
  int currentFanStatus = digitalRead(TOGGLE_FAN_PIN);
  if (currentFanStatus != prevFanStatus) {
    gasDetect = 0;
    if (currentFanStatus == HIGH) {
      toggleFanStatus = !toggleFanStatus;
    }
    prevFanStatus = currentFanStatus;
  }
}
void changeFanModeFromWeb(StaticJsonDocument<200> doc) {
    const char* SFanMode = doc["value"]["mode"];
    int mode = atoi(SFanMode);
    if (toggleFanStatus) {
      fanMode = mode;
      controlFanMode();
    }
}
void toggleFanFromWeb(StaticJsonDocument<200> doc) {
  const char* toggleMode = doc["value"]["status"];
  if (strcmp(toggleMode, "ON") == 0) {
    toggleFanStatus = true;
  } else if (strcmp(toggleMode, "OFF") == 0)  {
    toggleFanStatus = false;
  }
}
/* Auto turn fan base on air quality */
void toggleFanAccordingAirQuality() {
  while(digitalRead(CHANGE_LCD_MODE_PIN)) { gasDetect = 0; }
  while(digitalRead(TOGGLE_FAN_PIN)) { gasDetect = 0; }
  if (gasDetect >= 2000 || dustDensity >= 1) {
    fanMode3();
    interfereFan_AirQuality = false;
  } else if (!interfereFan_AirQuality) {
    interfereFan_AirQuality = true;
    fanMode = 1;
  }
}
/* Schedule */
void setFanTurnTime(StaticJsonDocument<200> doc) {
  turnTime.start_date = doc["value"]["start_date"].as<unsigned long>();
  turnTime.end_date = doc["value"]["end_date"].as<unsigned long>();
  turnTime.start_time = doc["value"]["start_time"].as<String>();
  turnTime.end_time = doc["value"]["end_time"].as<String>();
  turnTime.mode = doc["value"]["mode"].as<int>();
  Serial.println("TurnTime Data Updated:");
  Serial.print("Start Date (Epoch): ");
  Serial.println(turnTime.start_date);
  Serial.print("End Date (Epoch): ");
  Serial.println(turnTime.end_date);
  Serial.print("Start Time: ");
  Serial.println(turnTime.start_time);
  Serial.print("End Time: ");
  Serial.println(turnTime.end_time);
  Serial.print("Mode: ");
  Serial.println(turnTime.mode);
}

void toggleFanAccordingSchedule() {
  if (turnTime.start_date <= currentEpochTime && currentEpochTime <= turnTime.end_date) {
    if (turnTime.start_time <= currentTimeString && currentTimeString <= turnTime.end_time) {
      toggleFanStatus = true;
      fanMode = turnTime.mode;
    } else {
      toggleFanStatus = false;
    }
  }
}


/* Fan call */
void controlFan() {
  /* Control */
  if (interfereFan_AirQuality) {
    toggleFan();
    changeFanMode();  
  }
  /* Autorun */
  toggleFanAccordingAirQuality();
  toggleFanAccordingSchedule();
}

/* INPUT SENSOR */
/* MQ135 */
void readMQ135() {
  gasDetect = analogRead(MQ135_PIN);
  if (isnan(gasDetect)) {
    Serial.println("Error: Fail to read from MQ135 sensor");
    return;
  }
}
/* DHT11 */
void readDHT11() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Error: Fail to read from DHT11 sensor");
    return;
  }
}
/* GP2Y1010 */
void readGP2Y() {
  dustDensity = dustSensor.getDustDensity();
  if (isnan(dustDensity)) {
    Serial.println("Error: Fail to read from GP2Y1010AU0F");
  }
}
/* Read Input Sensor */
void readInputSensor() {
  readMQ135();
  readDHT11();
  readGP2Y();
}
/* OUTPUT DEVICE */
/* LCD */
void displayMQ135onLCD() {
  // Serial.println("LCD MODE 1: AIR QUALILTY & DUST DENSITY");
  lcd.setCursor(0, 0);
  lcd.print("GAS: ");
  lcd.print(gasDetect);
  lcd.print(" PPM");
  lcd.setCursor(0, 1);
  lcd.print("PM: ");
  lcd.print(dustDensity);
  lcd.print(" ug/m3");
}
void displayDHT11onLCD() {
  // Serial.println("LCD MODE 2: TEMPERATURE & HUMIDITY");
  lcd.setCursor(0, 0);
  lcd.print("T: ");
  lcd.print(temperature);
  lcd.print("C");
  lcd.setCursor(0, 1);
  lcd.print("H: ");
  lcd.print(humidity);
  lcd.print("%");
}
void setCurrentTime() {
  String formattedTime = timeClient.getFormattedTime();
  currentHour = formattedTime.substring(0, 2).toInt();
  currentMinute = formattedTime.substring(3, 5).toInt();
  currentSecond = formattedTime.substring(6, 8).toInt();
  currentTimeString = formattedTime;

  currentEpochTime = timeClient.getEpochTime();  
  struct tm *timeStruct = localtime(&currentEpochTime);  
  currentDay = timeStruct->tm_mday;
  currentMonth = timeStruct->tm_mon + 1;
  currentYear = timeStruct->tm_year + 1900;
  currentDateString = String(currentDay) + "/" + String(currentMonth) + "/" + String(currentYear);
}
void displayTIMEonLCD() {
    // Serial.println("LCD MODE 3: TIME MODE");
    lcd.setCursor(0, 0);
    lcd.print("DATE: ");
    lcd.print(currentDateString);
    lcd.setCursor(0, 1);
    lcd.print("TIME: ");
    lcd.print(currentTimeString);
}
void displayLCD(int lcdMode, int delayLCD) {
  if (millis() - currentLCDMillis > delayLCD) {
      forceLCD = false;
      lcd.clear();
      if (lcdMode == 1) {
        displayMQ135onLCD();
      } else if (lcdMode == 2) {
        displayDHT11onLCD();
      } else {
        displayTIMEonLCD();
      }
    currentLCDMillis = millis();
  } else {
    if (forceLCD) {
      forceLCD = false;
      lcd.clear();
      if (lcdMode == 1) {
        displayMQ135onLCD();
      } else if (lcdMode == 2) {
        displayDHT11onLCD();
      } else {
        displayTIMEonLCD();
      }
    }
  }
}
void controlLCD() {
  int currentLCDStatus = digitalRead(CHANGE_LCD_MODE_PIN);
  if (currentLCDStatus != prevLCDStatus) {
    gasDetect = 0;
    if (currentLCDStatus == HIGH) {
      lcdMode++;
      if (lcdMode > 3) {
        lcdMode = 1;
      }
      forceLCD = true;
    }
    prevLCDStatus = currentLCDStatus;
  }
  displayLCD(lcdMode, 1000);
}

/* MAIN FUNCTION */
/* SET UP */
void setup() {
  Serial.begin(115200);
  /* WiFi */
  // setupWiFi();
  WiFiManager wifiManager;
  wifiManager.resetSettings();
  wifiManager.autoConnect("Lafi-Setup");
  Serial.println("Connected to Wi-Fi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  /* MQTT */
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(mqttCallback);
  /* NTP Client */
  timeClient.setTimeOffset(25200); 
  timeClient.begin();
  /* Reset Default Value For Light */
  resetLight();
  /* Light Initialize */
  pixels.begin();  
  pixels.setBrightness(0);
  pinMode(TOGGLE_LIGHT_PIN, INPUT);
  /* Fan Initialize */
  pinMode(TOGGLE_FAN_PIN, INPUT);
  pinMode(CHANGE_FAN_MODE_PIN, INPUT);
  pinMode(LM_CONTROL_FAN_SPEED_PIN, OUTPUT);
  pinMode(LM_TOGGLE_FAN_PIN, OUTPUT);
  /* INPUT SENSOR */
  /* MQ135 */
  /* DHT11 */
  dht.begin();
  /* GP2Y1010AU0F */
  pinMode(GP2Y_LED_PIN, OUTPUT);
  /* OUTPUT DEVICE */
  /* LCD */
  pinMode(CHANGE_LCD_MODE_PIN, INPUT);
  lcd.init();
  lcd.backlight();
  /* LED */
  pinMode(G_PIN, OUTPUT);
  pinMode(Y_PIN, OUTPUT);
  pinMode(R_PIN, OUTPUT);

}
/* LOOP */
void loop() {
  /* Connect To WiFi and MQTT Server and NTP Server */
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  /* Time Update */
  timeClient.update();
  setCurrentTime();
  /* Control Light */
  controlLight();
  /* Control Fan */
  controlFan();
  /* Read Sensor Value and create Json Object*/
  readInputSensor();
  /* Publish read data */
  publish(2000);
  /* LCD Control */
  controlLCD();
}




