import { Express, Request, Response, NextFunction } from "express";
import SensorDataModel from "../models/SensorDataModel";
import { connectToMqttBroker } from "../config/mqtt/connectToMqttBroker";

let receivedData: { [key: string]: any } = {};
const handleMqttData = (data: string) => {
  receivedData = JSON.parse(data);
};
connectToMqttBroker(handleMqttData);


let intervalPusher: string | number | NodeJS.Timeout | undefined; 

function startPusher() {
  intervalPusher = setInterval(() => {
    fetch("https://www.pushsafer.com/api?k=RgFd6WlLmbsmNaJ1cTzW&m=Air%20quality%20Not%20Good")
      .then(response => response.json())
      .then(data => {
        console.log("Data sent:", data); 
      })
      .catch(error => {
        console.error("Error sending data:", error);
      });
  }, 10000);
}
function stopPusher() {
  clearInterval(intervalPusher);
}


const savaData = async () => {
  try {
    const sensorData = new SensorDataModel(receivedData);
    if (sensorData.MQ135 >= 2000 || sensorData.dustDensity >= 1) {
      if (!intervalPusher) {
        startPusher();
      }
    } else {
      if (intervalPusher) {  
          stopPusher();
      }
    }
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
