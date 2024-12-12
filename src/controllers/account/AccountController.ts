import { Express, Request, Response } from "express";
import UserModel from "../../models/UserModel";

const AccountController = (req: Request, res: Response) => {
    const userData = {
        name: req.session.name,
        email: req.session.email,
        gender: req.session.gender,
        dob: req.session.dob,
        createdAt: req.session.createdAt
    }
    res.render('layouts/accountLayout', {
        body: '../pages/account/Account.ejs',
        title: "Account",
        userData
    })
};
export default AccountController;
