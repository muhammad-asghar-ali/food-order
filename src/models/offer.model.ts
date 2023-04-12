import mongoose, { Schema, Document, Model } from "mongoose";

export interface OfferDoc extends Document {
  offerType: string;
  vendors: [any];
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  promoType: string;
  bank: [any];
  bsina: [any];
  pincode: number;
  isActive: boolean;
}

const OfferSchema = new Schema(
  {
    offerType: { type: String },
    vendors: [
      {
        type: Schema.Types.ObjectId,
        ref: "vendor",
      },
    ],
    title: { type: String },
    description: { type: String },
    minValue: { type: Number },
    offerAmount: { type: Number },
    startValidity: { type: Date },
    endValidity: { type: Date },
    promocode: { type: String },
    promoType: { type: String },
    bank: [{ type: String }],
    bsins: [{ type: Number }],
    pincode: { type: Number },
    isActive: { type: Boolean },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

const Offer = mongoose.model<OfferDoc>("offer", OfferSchema);

export { Offer };
