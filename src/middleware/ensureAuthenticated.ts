import { Request, Response, NextFunction } from "express";

const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect("/");
  }
};

export default ensureAuthenticated;
