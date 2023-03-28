import mongoose, { Schema, Model, Document, model } from "mongoose";

interface VendorDoc extends Document {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  salt: string;
  serviceAvailabilty: boolean;
  coverImage: string;
  rating: string;
  foods: any;
}

const VendorSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    foodType: { type: [String] },
    pincode: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    serviceAvailabilty: { type: Boolean },
    coverImages: { type: [String] },
    rating: { type: String },
    foods: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "food",
      },
    ],
  },
  { 
    // set the json response here
    toJSON: {
      transform(doc, ret) {
        delete ret.password,
        delete ret.salt,
        delete ret.__v,
        delete ret.createdAt,
        delete ret.updatedAt
      }
    },
    timestamps: true 
  }
);

const Vendor = mongoose.model<VendorDoc>("vendor", VendorSchema);

export { Vendor };
