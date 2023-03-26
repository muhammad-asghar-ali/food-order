import { NextFunction, Request, Response } from "express";
import { CreateVendorInput } from "../dtos";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

// refactor code 
// email is an optional
export const FindVendor = async (id: string | undefined, email?: string )  => {
  if(email) {
    return await Vendor.findOne({email: email})
  } else {
    return await Vendor.findById(id)
  }
}

export const createVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    ownerName,
    foodType,
    address,
    pincode,
    password,
    phone,
    email,
  } = <CreateVendorInput>req.body;

  // check already exist vendor
  const alreadyExist = await FindVendor("", email)

  // if it exist thro the response
  if (alreadyExist) {
    return res
      .status(409)
      .json({ success: false, message: "vendor already exist" });
  }

  // generate salt
  const salt = await GenerateSalt();

  // encrypt the password
  const hashPassword = await GeneratePassword(password, salt);

  // create new vendor
  const vendor = await Vendor.create({
    name,
    ownerName,
    foodType,
    address,
    pincode,
    password: hashPassword,
    phone,
    email,
    salt: salt,
    rating: 0,
    serviceAvailabilty: false,
    coverImage: [],
  });

  // send a response in json format
  res.status(201).json({ success: true, data: vendor });
};

export const getVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // find all vendors
  const vendors = await Vendor.find({}).lean();

  // if no vendor exists
  if (!vendors.length) {
    return res.status(404).json({ success: false, message: "no vendor exist" });
  }

  // send a response in json format
  res.status(200).json({ success: true, data: vendors });
};

export const getVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "id is missing in params" });
  }

  const vendor = await FindVendor(id);

  if (!vendor) {
    return res
      .status(400)
      .json({ success: false, message: "no vendor found" });
  }
  // send a response in json format
  res.status(200).json({ success: true, data: vendor });
};