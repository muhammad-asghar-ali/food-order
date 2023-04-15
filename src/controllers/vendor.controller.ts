import { NextFunction, Request, Response } from "express";
import { CreateOfferInputs, EditVendorInput, VendorLoginInput, CreateFoodInput } from "../dtos";
import { Food, Offer, Order } from "../models";
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

    const { lat, lng } = req.body;

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to Update vendor profile",
      });
    }

    const existingVendor = await FindVendor(user._id);

    if (existingVendor) {
      existingVendor.serviceAvailabilty = !existingVendor.serviceAvailabilty;
      if(lat && lng){
          existingVendor.lat = lat;
          existingVendor.lng = lng;
      }
      const saveResult = await existingVendor.save();

      res.status(200).json({
        sucess: true,
        data: saveResult,
      });
    }

    return res.json({success: false, message: 'Unable to Update vendor profile '})
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

export const getCurrentOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        sucess: false,
        message: "order not found",
      });
    }

    const orders = await Order.find({ vendorId: user._id }).populate(
      "items.food"
    );

    if (!orders.length) {
      return res.status(404).json({
        sucess: false,
        message: "order not found",
      });
    }

    res.status(200).json({ success: true, data: orders });
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
    const orderId = req.params.id;

    const { status, remarks, time } = req.body;

    if (!orderId) {
      return res.status(400).json({
        sucess: false,
        message: "order id not found",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: status,
        remarks: remarks,
        readyTime: time,
      },
      { new: true }
    ).populate("items.food");

    if (!order) {
      return res.status(404).json({
        sucess: false,
        message: "unable to process order",
      });
    }

    res.status(200).json({ success: true, data: order });
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
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        sucess: false,
        message: "order id not found",
      });
    }

    const order = await Order.findById(orderId).populate("items.food");

    if (!order) {
      return res.status(404).json({
        sucess: false,
        message: "order not found",
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const addOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    // const {
    //   offerType,
    //   description,
    //   title,
    //   minValue,
    //   offerAmount,
    //   startValidity,
    //   endValidity,
    //   promoType,
    //   promocode,
    //   bank,
    //   bins,
    //   pincode,
    //   isActive,
    // } = <CreateOfferInputs>req.body;

    const offerBody = <CreateOfferInputs>req.body;

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to create offer",
      });
    }

    const vendor = await FindVendor(user._id);

    if (!vendor) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to create offer",
      });
    }
    offerBody.vendors = [vendor];
    const offer = await Offer.create(offerBody);

    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Offers are not available",
      });
    }

    const offers = await Offer.find().populate("vendors");
    if (!offers.length) {
      return res.status(400).json({
        sucess: false,
        message: "Offers are not available",
      });
    }

    let currentOffers = [];
    offers.map((ele) => {
      if (ele.vendors) {
        ele.vendors.map((v) => {
          if (v._id.toString() === user._id) {
            currentOffers.push(ele);
          }
        });
      }

      if (ele.offerType === "GENERIC") {
        currentOffers.push(ele);
      }
    });

    res.status(200).json({ success: true, data: currentOffers });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const editOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    const offerId = req.params.id;

    if (!offerId) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to edit offer",
      });
    }

    const offerBody = <CreateOfferInputs>req.body;

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to edit offer",
      });
    }

    const vendor = await FindVendor(user._id);

    if (!vendor) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to edit offer",
      });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(offerId, offerBody, {
      new: true,
    });

    if (!updatedOffer) {
      return res.status(400).json({
        sucess: false,
        message: "Unable to edit offer",
      });
    }
    res.status(200).json({ success: true, data: updatedOffer });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};
