import { Express, Request, Response } from "express";
import UserModel from "../models/UserModel";


const updateTimeTurningFan = (app:Express) => {
    app.post('/api/update_fan_time', async (req: Request, res: Response) => {
        try {
            const email = req.session.email;
            if (!email) {
              return res.status(400).json({ message: "User is not authenticated" });
            }
            const { startDate, endDate, startTime, endTime, fanMode } = req.body;
            const updatedUser = await UserModel.findOneAndUpdate(
                { email },
                { startDate, endDate, startTime, endTime, fanMode },
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({
                message: "Color settings updated successfully",
                updatedSettings: {
                startDate: updatedUser.startDate,
                endDate: updatedUser.endDate,
                startTime: updatedUser.startTime,
                endTime: updatedUser.endTime,
                fanMode: updatedUser.fanMode
                },
            });
        } catch(error) {
            res.json(req.body)
        }
    })
}
export default updateTimeTurningFan