import express, { NextFunction, Request, Response, Express } from "express";
import HomePageController from "./controllers/HomePageController";
import LightSettingController from "./controllers/LightSettingController";
import AFSettingController from "./controllers/AFSettingController";
import LoginController, {postLoginController} from "./controllers/account/LoginController";
import RegisterController, {postRegisterController} from "./controllers/account/RegisterController";
import AccountController from "./controllers/account/AccountController";

import ensureAuthenticated from "./middleware/ensureAuthenticated";

function router(app: Express) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", LoginController);
  app.post("/", postLoginController);
  
  app.get("/register", RegisterController);
  app.post("/register", postRegisterController);

  app.get("/account", ensureAuthenticated, AccountController);
  app.get("/home", ensureAuthenticated, HomePageController);
  app.get("/af-setting",ensureAuthenticated, AFSettingController);
  app.get("/light-setting",ensureAuthenticated, LightSettingController);
}
export default router;
