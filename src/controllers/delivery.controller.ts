import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, { Request, Response, NextFunction } from "express";
import { UserLoginInput, CreateDeliveryUserInput } from "../dtos";

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

  if (existingDeliveryUser !== null) {
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

  if (result) {
    //Generate the Signature
    const signature = await GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });
    // Send the result
    return res
      .status(201)
      .json({ signature, verified: result.verified, email: result.email });
  }

  return res.status(400).json({ msg: "Error while creating Delivery user" });
};

export const deliveryLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const validation = await ValidatePassword(
      password,
      deliveryUser.password,
      deliveryUser.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });

      return res.status(200).json({
        signature,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });
    }
  }

  return res.json({ msg: "Error Login" });
};
