import { Express, Request, Response } from "express";
import UserModel from "../models/UserModel";


const updateUserLightColor = (app:Express) => {
    app.post('/api/update_color', async (req: Request, res: Response) => {
        try {
            const email = req.session.email;
            if (!email) {
              return res.status(400).json({ message: "User is not authenticated" });
            }
            const { r, g, b } = req.body;
            const updatedUser = await UserModel.findOneAndUpdate(
                { email },
                { r, g, b },
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(200).json({
                message: "Color settings updated successfully",
                updatedSettings: {
                  r: updatedUser.r,
                  g: updatedUser.g,
                  b: updatedUser.b,
                },
            });
        } catch(error) {
            res.json(req.body)
        }
    })
}
export default updateUserLightColor