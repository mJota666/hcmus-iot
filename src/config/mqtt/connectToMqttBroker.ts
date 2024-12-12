import mqtt, { MqttClient } from "mqtt";
import dotenv from "dotenv";
dotenv.config();

/* Set MQTT_Broker and MQTT_Topic */
let data: string;
const mqttBrokerUrl = process.env.MQTT_BROKER_URL as string;
const mqttSubTopic = process.env.MQTT_SUB_TOPIC as string;
const mqttPubTopicToggleLight = process.env.MQTT_PUB_TOPIC_TOGGLE_LIGHT as string;
if (!mqttBrokerUrl || !mqttSubTopic || !mqttPubTopicToggleLight) {
  throw new Error("Missing MQTT_BROKER_URL, MQTT_SUB_TOPIC or MQTT_PUB_TOPIC in .env file");
}
/* MQTT Initialize */
let client: MqttClient;
// Function to publish a message
const publishMessage = (topic: string, message: string) => {
  if (client && client.connected) {
    client.publish(topic, message, { qos: 0 }, (err) => {
      if (err) {
        console.error("Failed to publish message:", err);
      } else {
        console.log(`Message published to topic ${topic}: ${message}`);
      }
    });
  } else {
    console.error("MQTT client is not connected. Cannot publish message.");
  }
};
// Subscribe to topic
const connectToMqttBroker = (callback: (data: string) => void) => {
  client = mqtt.connect(mqttBrokerUrl, {
    reconnectPeriod: 1000,
    connectTimeout: 3000,
    clean: true,
  });

  client.on("connect", () => {
    console.log("Connected to MQTT Broker:", mqttBrokerUrl);

    client.subscribe(mqttSubTopic, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log(`Subscribed to topic: ${mqttSubTopic}`);
      }
    });

    client.on("message", (topic, message) => {
      callback(message.toString());
    });

    client.on("error", (error) => {
      console.error("MQTT client error:", error);
    });

    client.on("reconnect", () => {
      console.log("Attempting to reconnect to MQTT broker...");
    });

    client.on("close", () => {
      console.log("Connection to MQTT broker closed.");
    });

    client.on("offline", () => {
      console.log("MQTT client is offline.");
    });
  });
  
};

export { connectToMqttBroker,publishMessage };
