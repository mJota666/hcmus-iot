import mongoose from "mongoose";
import { MongoClient, ServerApiVersion } from "mongodb";
const uri =
  "mongodb+srv://root:123@hcmusiot.mowru.mongodb.net/hcmusIOT?retryWrites=true&w=majority&appName=hcmusIOT";

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connect to Mongodb cloud successfully !");
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    else console.log("Unknown Error");
  }
};

export default connectDB;
