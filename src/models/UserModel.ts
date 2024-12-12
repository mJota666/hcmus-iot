import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  dob: Date; 
  gender: "male" | "female" | "other";
  createdAt: string; // Epoch string
  updatedAt?: string; // Epoch string
  lightMode1: string; // Stored as a string
  lightMode2: string; // Stored as a string
  lightMode3: string; // Stored as a string
  r: string; // Stored as a string
  g: string; // Stored as a string
  b: string; // Stored as a string
  startDate: string; // Epoch string
  endDate: string; // Epoch string
  startTime: string; // HH:mm:ss format
  endTime: string; // HH:mm:ss format
  fanMode: string; // Stored as a string
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 3,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    lightMode1: {
      type: String,
      default: "100", // Default light mode is "0"
    },
    lightMode2: {
      type: String,
      default: "50", // Default light mode is "0"
    },
    lightMode3: {
      type: String,
      default: "25", // Default light mode is "0"
    },
    r: {
      type: String,
      default: "255", // Default R value is "255"
    },
    g: {
      type: String,
      default: "255", // Default G value is "255"
    },
    b: {
      type: String,
      default: "255", // Default B value is "255"
    },
    startDate: {
      type: String,
      default: () => Math.floor(Date.now() / 1000).toString(), // Current date in epoch string
    },
    endDate: {
      type: String,
      default: () => Math.floor(Date.now() / 1000).toString(), // Current date in epoch string
    },
    startTime: {
      type: String,
      default: "00:00:00", // Default start time
    },
    endTime: {
      type: String,
      default: "23:59:59", // Default end time
    },
    fanMode: {
      type: String,
      default: "1", // Default fan mode
    },
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
