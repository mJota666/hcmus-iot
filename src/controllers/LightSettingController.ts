import { Express, Request, Response } from "express";

const LightSettingController = (req: Request, res: Response) => {
  res.render("layouts/main", {
    body: "../pages/LightSettingPage",
    title: "Light Setting",
  });
};

export default LightSettingController;
