import { Express, Response, Request } from "express";
import { connectToMqttBroker } from "../config/mqtt/connectToMqttBroker";

let sensorData: { [key: string]: any } = {};
const handleMqttData = (data: string) => {
  sensorData = JSON.parse(data);
};
connectToMqttBroker(handleMqttData);

const api = (app: Express) => {
  app.get("/api/sensor_data", (req: Request, res: Response) => {
    if (Object.keys(sensorData).length > 0) {
      res.json(sensorData);
    } else {
      res.status(404).json({ error: "No data received yet" });
    }
  });
};

export default api;
