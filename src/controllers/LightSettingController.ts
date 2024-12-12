import { Express, Request, Response } from "express";
import UserModel from "../models/UserModel";

const fetchLightSetting = async(email:string) => {
  return await UserModel.findOne({email}).select('lightMode1 lightMode2 lightMode3 r g b');
}

const LightSettingController = async(req: Request, res: Response) => {
  try {
    const email = req.session.email;
    const user = await fetchLightSetting(email);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }  res.render("layouts/main", {
      body: "../pages/LightSettingPage",
      title: "Light Setting",
      lightMode1: user.lightMode1,
      lightMode2: user.lightMode2,
      lightMode3: user.lightMode3,
      r: user.r,
      g: user.g,
      b: user.b,
    });

  } catch(error) {
    console.log(error)
  }
};

export default LightSettingController;
