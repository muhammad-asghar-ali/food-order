import { NextFunction, Request, Response } from "express";
import { CreateVendorInput } from "../dtos";
import { DeliveryUser, Transaction, Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

// refactor code
// email is an optional
export const FindVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email: email });
  } else {
    return await Vendor.findById(id);
  }
};

export const createVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
    const alreadyExist = await FindVendor("", email);

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
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // find all vendors
    const vendors = await Vendor.find({}).lean();

    // if no vendor exists
    if (!vendors.length) {
      return res
        .status(404)
        .json({ success: false, message: "no vendor exist" });
    }

    // send a response in json format
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getTransections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = await Transaction.find();
    if (!transactions.length) {
      return res
        .status(404)
        .json({ success: false, message: "no transections found" });
    }
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getTransectionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const txnId = req.params.id;

    if (!txnId) {
      return res
        .status(400)
        .json({ success: false, message: "transection id is missing" });
    }

    const transaction = await Transaction.findById(txnId);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "no transections found" });
    }
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const verifyDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, status } = req.body;

    if (!_id) {
      return res
        .status(400)
        .json({ success: false, message: "delivery id is missing" });
    }

    const deliveryProfile = await DeliveryUser.findByIdAndUpdate(
      _id,
      { verified: status },
      { new: true }
    );

    if (!deliveryProfile) {
      return res.status(400).json({
        success: false,
        message: "unable to verify the delivery user",
      });
    }

    res.status(200).json({ success: true, data: deliveryProfile });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getDeliveryUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deliveryUsers = await DeliveryUser.find().select({email: 1, }).lean();

    if (!deliveryUsers.length) {
      return res.status(400).json({
        success: false,
        message: "unable to verify the delivery user",
      });
    }

    res.status(200).json({ success: true, data: deliveryUsers });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};
