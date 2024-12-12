import { Express, Request, Response } from "express";
import SensorDataModel from "../models/SensorDataModel";

const GetData = (app: Express) => {
    app.get('/api/get_data', async(req: Request, res: Response) => {
        try {
            const sensorData = await SensorDataModel.find(); 

            if (sensorData.length === 0) {
                return res.status(404).json({ status: "No data found" });
            }
            res.json({
                status: "successfully",
                data: sensorData, 
            });
        } catch (error) {
            console.error("Error fetching sensor data:", error);
            res.status(500).json({ status: "error", message: "Failed to fetch data" });
        }
    });
};

export default GetData;
