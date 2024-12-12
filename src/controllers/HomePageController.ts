import { Request, Response, NextFunction } from "express";

const HomePageController = (req: Request, res: Response) => {
  res.render("layouts/main", {
    body: "../pages/HomePage.ejs",
    title: "Home",
  });
};

export default HomePageController;
