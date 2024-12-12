import { Express, Request, Response, NextFunction } from "express";
import SensorDataModel from "../models/SensorDataModel";
import { connectToMqttBroker } from "../config/mqtt/connectToMqttBroker";

let receivedData: { [key: string]: any } = {};
const handleMqttData = (data: string) => {
  receivedData = JSON.parse(data);
};
connectToMqttBroker(handleMqttData);

const savaData = async () => {
  try {
    const sensorData = new SensorDataModel(receivedData);
    await sensorData.save();
    console.log("Saving data successfully !");
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("Unknown error while saving data");
    }
  }
};
const ReceiveAndStoreData = (app: Express) => {
  app.use("/api/receive_store_sensor_data", (req: Request, res: Response) => {
    if (Object.keys(receivedData).length > 0) {
      savaData();
      res.json(receivedData);
    } else {
      res.status(404).json({ error: "No data received yet" });
    }
  });
};

export default ReceiveAndStoreData;
