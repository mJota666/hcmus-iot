import { Express, Response, Request } from "express";
import UserModel from "../models/UserModel";
const fetchLightSetting = async(email:string) => {
  return await UserModel.findOne({email}).select('startDate endDate startTime endTime fanMode');
}

const formatEpochToDate = (epoch: string) => {
  const date = new Date(Number(epoch) * 1000); // Convert epoch to milliseconds
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
};

const AFSettingController = async(req: Request, res: Response) => {
  try {
    const email = req.session.email;
    const user = await fetchLightSetting(email);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    } 
    const startDateFormatted = formatEpochToDate(user.startDate);
    const endDateFormatted = formatEpochToDate(user.endDate); 
    res.render("layouts/main", {
      body: "../pages/AFSettingPage",
      title: "Air Filter Setting",
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      startTime: user?.startTime,
      endTime: user?.endTime,
      fanMode: user?.fanMode
    });
  } catch(error) {
    console.log(error)
  }
};
export default AFSettingController;
