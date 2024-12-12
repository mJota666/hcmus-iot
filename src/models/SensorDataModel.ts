import mongoose, { Schema, Document, Model } from "mongoose";

interface ISensorData extends Document {
  MQ135: number;
  temperature: number;
  humidity: number;
  dustDensity: number;
}

const SensorDataSchema: Schema = new Schema(
  {
    MQ135: { type: Number, required: true },
    temperature: { type: Number, require: true },
    humidity: { type: Number, require: true },
    dustDensity: { type: Number, require: true },
  },
  {
    timestamps: true,
  }
);

const SensorDataModel: Model<ISensorData> = mongoose.model<ISensorData>(
  "SensorDataModel",
  SensorDataSchema
);

export default SensorDataModel;
