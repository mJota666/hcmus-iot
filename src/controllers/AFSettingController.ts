import { Express, Response, Request } from "express";

const AFSettingController = (req: Request, res: Response) => {
  res.render("layouts/main", {
    body: "../pages/AFSettingPage",
    title: "Air Filter Setting",
  });
};
export default AFSettingController;
