import { Express, Request, Response, NextFunction } from "express";
import SensorDataModel from "../models/SensorDataModel";
import { connectToMqttBroker, publishMessage } from "../config/mqtt/connectToMqttBroker";

const PublishData = (app: Express) => {
    app.post('/api/publish_data', (req:Request, res: Response) => {
        const {topic, message} = req.body
        publishMessage(topic, message);
        res.json({status: "successfully"})
    })
}
export default PublishData