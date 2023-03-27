import { NextFunction, Request, Response } from "express";
import { VendorLoginInput } from "../dtos";
import { Vendor } from "../models";
import { GenerateSignature, ValidatePassword } from "../utility";
import { FindVendor } from "./admin.controller";

export const vendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VendorLoginInput>req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "missing values in payload" });
  }

  const alreadyExist = await FindVendor("", email);

  if (!alreadyExist) {
    return res
      .status(400)
      .json({ success: false, message: "invaild credentails" });
  }

  const validate = await ValidatePassword(
    password,
    alreadyExist.password,
    alreadyExist.salt
  );

  if (!validate) {
    return res
      .status(400)
      .json({ success: false, message: "invaild credentails" });
  }

  // generate signature
  const signature = GenerateSignature({
    _id: alreadyExist._id,
    name: alreadyExist.name,
    email: alreadyExist.email,
    foodType: alreadyExist.foodType,
  });

  res.status(200).json({ success: true, token: signature });
};

export const getVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "vendor Information Not Found" });
  }

  const existingVendor = await FindVendor(user._id);
  res.status(200).json({ success: true, data: existingVendor });
};

export const updateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const updateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
