import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, { Request, Response, NextFunction } from "express";
import {
  UserLoginInput,
  CreateDeliveryUserInput,
  EditCustomerProfileInput,
} from "../dtos";

import { Customer, DeliveryUser, Food, Vendor } from "../models";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  onRequestOTP,
  ValidatePassword,
} from "../utility";

export const deliverySignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deliveryUserInputs = plainToClass(CreateDeliveryUserInput, req.body);

    const validationError = await validate(deliveryUserInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { email, phone, password, address, firstName, lastName, pincode } =
      deliveryUserInputs;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const existingDeliveryUser = await DeliveryUser.findOne({ email: email });

    if (!existingDeliveryUser) {
      return res
        .status(400)
        .json({ message: "A Delivery User exist with the provided email ID!" });
    }

    const result = await DeliveryUser.create({
      email: email,
      password: userPassword,
      salt: salt,
      phone: phone,
      firstName: firstName,
      lastName: lastName,
      address: address,
      pincode: pincode,
      verified: false,
      lat: 0,
      lng: 0,
    });

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Error while creating Delivery user",
      });
    }
    //Generate the Signature
    const signature = await GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });
    // Send the result
    return res.status(201).json({
      success: true,
      data: { signature, verified: result.verified, email: result.email },
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const deliveryLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loginInputs = plainToClass(UserLoginInput, req.body);

    const validationError = await validate(loginInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(400).json(validationError);
    }

    const { email, password } = loginInputs;

    const deliveryUser = await DeliveryUser.findOne({ email: email });

    if (deliveryUser) {
      return res.json({ success: false, message: "Error Login" });
    }

    const validation = await ValidatePassword(
      password,
      deliveryUser.password,
      deliveryUser.salt
    );

    if (!validation) {
      return res.json({ success: false, message: "Error Login" });
    }

    const signature = GenerateSignature({
      _id: deliveryUser._id,
      email: deliveryUser.email,
      verified: deliveryUser.verified,
    });

    return res.status(200).json({
      success: true,
      data: {
        signature,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      },
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getDeliveryProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deliveryUser = req.user;

    if (deliveryUser) {
      return res
        .status(400)
        .json({ success: false, message: "Error while Fetching Profile" });
    }
    const profile = await DeliveryUser.findById(deliveryUser._id);

    if (!profile) {
      return res
        .status(400)
        .json({ success: false, message: "Error while Fetching Profile" });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const editDeliveryProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deliveryUser = req.user;

    const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

    const validationError = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(400).json(validationError);
    }

    const { firstName, lastName, address } = customerInputs;

    if (deliveryUser) {
      const profile = await DeliveryUser.findById(deliveryUser._id);

      if (profile) {
        profile.firstName = firstName;
        profile.lastName = lastName;
        profile.address = address;
        const result = await profile.save();

        return res.status(201).json({ success: true, data: result });
      }
    }
    return res
      .status(400)
      .json({ success: false, message: "Error while Updating Profile" });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};
