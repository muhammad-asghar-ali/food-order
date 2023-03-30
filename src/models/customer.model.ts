import mongoose, { Schema, Model, Document, model } from "mongoose";

interface CustomerDoc extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  salt: string;
  verified: boolean;
  otp: number;
  otp_expiry: Date;
  lat: number;
  leg: number;
}

const CustomerSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    verified: { type: Boolean },
    otp: { type: Number, required: true },
    otp_expiry: { type: Date , required: true },
    lat: { type: Number }, 
    leg: { type: Number },
  },
  {
    // set the json response here
    toJSON: {
      transform(doc, ret) {
        delete ret.password,
          delete ret.salt,
          delete ret.__v,
          delete ret.createdAt,
          delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Customer = mongoose.model<CustomerDoc>("customer", CustomerSchema);

export { Customer };
