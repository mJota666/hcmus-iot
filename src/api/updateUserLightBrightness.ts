import { Express, Request, Response } from "express";
import UserModel from "../models/UserModel";


const updateUserLightBrightness = (app:Express) => {
    app.post('/api/update_brightness', async (req: Request, res: Response) => {
        try {
            const email = req.session.email;
            if (!email) {
              return res.status(400).json({ message: "User is not authenticated" });
            }
            const { lightMode1, lightMode2, lightMode3 } = req.body;
            const updatedUser = await UserModel.findOneAndUpdate(
                { email },
                { lightMode1, lightMode2, lightMode3 },
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({
                message: "Light mode updated successfully",
                updatedSettings: {
                lightMode1: updatedUser.lightMode1,
                lightMode2: updatedUser.lightMode2,
                lightMode3: updatedUser.lightMode3,
                },
            });
        } catch(error) {
            res.json(req.body)
        }
    })
}
export default updateUserLightBrightness