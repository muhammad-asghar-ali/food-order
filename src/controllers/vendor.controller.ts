import { NextFunction, Request, Response } from "express";
import { EditVendorInput, VendorLoginInput } from "../dtos";
import { CreateFoodInput } from "../dtos/food.dto";
import { Food } from "../models";
import { GenerateSignature, ValidatePassword } from "../utility";
import { FindVendor } from "./admin.controller";

export const vendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "vendor Information Not Found" });
    }

    const existingVendor = await FindVendor(user._id);
    res.status(200).json({ success: true, data: existingVendor });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const updateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { foodType, name, address, phone } = <EditVendorInput>req.body;

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to Update vendor profile",
      });
    }

    const existingVendor = await FindVendor(user._id);

    if (existingVendor) {
      existingVendor.name = name || existingVendor.name;
      existingVendor.address = address || existingVendor.address;
      existingVendor.phone = phone || existingVendor.phone;
      existingVendor.foodType = foodType || existingVendor.foodType;
      const saveResult = await existingVendor.save();

      res.status(200).json({
        sucess: true,
        data: saveResult,
      });
    }
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const updateVendorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user) {
    return res.status(400).json({
      sucess: false,
      message: "Unable to update cover image",
    });
  }
  const vendor = await FindVendor(user._id);

  if (!vendor) {
    return res.status(400).json({
      sucess: false,
      message: "Unable to update cover image",
    });
  }

  const files = req.files as [Express.Multer.File];

  const images = files.map((file: Express.Multer.File) => file.filename);

  vendor.coverImages.push(...images);

  const saveResult = await vendor.save();

  return res.json(saveResult);
};

export const updateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to Update vendor profile",
      });
    }

    const existingVendor = await FindVendor(user._id);

    if (existingVendor) {
      existingVendor.serviceAvailabilty = !existingVendor.serviceAvailabilty;

      const saveResult = await existingVendor.save();

      res.status(200).json({
        sucess: true,
        data: saveResult,
      });
    }
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const addFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { name, description, category, foodType, readyTime, price } = <
      CreateFoodInput
    >req.body;

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to create food",
      });
    }

    const vendor = await FindVendor(user._id);

    if (vendor) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);
      const food = await Food.create({
        vendorId: vendor._id,
        name: name,
        description: description,
        category: category,
        price: price,
        rating: 0,
        readyTime: readyTime,
        foodType: foodType,
        images: images,
      });

      vendor.foods.push(food);
      const result = await vendor.save();
      return res.status(200).json({ sucess: true, data: result });
    } else {
      return res.status(404).json({
        sucess: false,
        message: "vendor not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to get foods",
      });
    }

    const foods = await Food.find({ vendorId: user._id }).lean();

    if (!foods.length) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to get foods",
      });
    }

    res.status(200).json({ sucess: true, data: foods });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
   
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const processOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
   
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
   
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};
