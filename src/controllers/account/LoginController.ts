import { Express, Request, Response } from "express";
import UserModel, { IUser } from "../../models/UserModel";
import session from "express-session";
import bcrypt from "bcrypt"


export const postLoginController = async(req:Request, res:Response) => {
  try {
    const { email, password } = req.body
    // Check valid Email
    const user = await UserModel.findOne({ email }) as IUser | null;
    if (!user) {
      return res.status(400).json({message: "Invalid email"})
    }
    // Check valid Password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({message: "Invalid password"})
    }
    // Login successfully
    console.log(user)
    req.session.userId = user._id.toString();
    req.session.name = user.name.toString();
    req.session.email = user.email.toString();
    req.session.dob = new Date(user.dob.toString()).toLocaleDateString();
    req.session.createdAt = new Date(user.createdAt.toString()).toLocaleDateString();
    // req.session.createAccount = new Date(user.dob.toString()).toLocaleDateString()
    req.session.gender = user.gender.toString();
    console.log(req.session)
    res.redirect('/home')
  }  catch(error) {
    console.log(error)
  }
}

const LoginController = (req: Request, res: Response) => {
  res.render("pages/account/Login");
};
export default LoginController;
