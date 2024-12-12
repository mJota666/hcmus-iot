import { Express, Request, Response } from "express";
import UserModel from "../../models/UserModel";
import bcrypt from 'bcrypt'

export const postRegisterController = async(req: Request, res:Response) => {
  try {
    const { name, email, password, dob, gender } = req.body
    // check exists email
    const existingUser = await UserModel.findOne({ email  });
    if (existingUser) {
      return res.status(400).send({ error: "Email already in use!" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const userRegister = new UserModel({
      name,
      email,
      password: hashedPassword,
      dob,
      gender,
    });
    await userRegister.save(); 
    res.redirect('/')
  } catch(error) {
    console.log(error)
  }
}

const RegisterController = (req: Request, res: Response) => {
  res.render("pages/account/Register");
};
export default RegisterController;
