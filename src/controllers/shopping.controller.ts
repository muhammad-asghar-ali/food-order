import { NextFunction, Request, Response } from "express";
import { FoodDoc, Offer, Vendor } from "../models";

export const getFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "pincode in missing",
      });
    }

    const result = await Vendor.find({
      pincode: pincode,
      serviceAvailabilty: true,
    })
      .sort([["rating", "descending"]])
      .populate("foods");

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "data Not found!" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "pincode in missing",
      });
    }

    const result = await Vendor.find({
      pincode: pincode,
      serviceAvailabilty: true,
    })
      .sort([["rating", "descending"]])
      .limit(10);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "data Not found!" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getFoodsIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "pincode in missing",
      });
    }

    const result = await Vendor.find({
      pincode: pincode,
      serviceAvailabilty: true,
    }).populate("foods");

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "data Not found!" });
    }

    let foodResult: any = [];

    result.map((vendor) => {
      if (!vendor.foods) {
      } else {
        const foods = vendor.foods as [FoodDoc];

        foodResult.push(...foods.filter((food) => food.readyTime <= 30));
      }
    });

    res.status(200).json({ success: true, data: foodResult });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const searchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "pincode in missing",
      });
    }

    const result = await Vendor.find({
      pincode: pincode,
      serviceAvailabilty: true,
    }).populate("foods");

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "data Not found!" });
    }

    let foodResult: any = [];
    result.map((vendor) => {
      // remove null vendor w ith null foods
      foodResult.push(...vendor.foods);
    });

    res.status(200).json({ success: true, data: foodResult });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const restaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id in missing",
      });
    }

    const result = await Vendor.findById(id).populate("foods");

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "data Not found!" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getAvailableOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pincode = req.params.pincode;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Can not get the offers",
      });
    }

    const offers = await Offer.find({ pincode: pincode, isActive: true });

    if (!offers) {
      return res.status(404).json({
        success: false,
        message: "No offer avaialable",
      });
    }

    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};
