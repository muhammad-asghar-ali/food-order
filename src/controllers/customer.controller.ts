import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { CreateCustomerInput } from "../dtos/customer.dto";
import { validate } from "class-validator";
import { GeneratePassword, GenerateSalt, GenerateSignature } from "../utility";
import { Customer } from "../models";
import { GenerateOtp, onRequestOTP } from "../utility/notifications";

export const customerSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerInputs = plainToClass(CreateCustomerInput, req.body);

    const validationError = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { email, phone, password } = customerInputs;

    // gen slat and hash password
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    // genrate otp and expiry
    const { otp, expiry } = GenerateOtp();

    const existingCustomer = await Customer.findOne({ email: email });
    if (existingCustomer !== null) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exist!" });
    }

    const result = await Customer.create({
      email: email,
      password: userPassword,
      salt: salt,
      phone: phone,
      otp: otp,
      otp_expiry: expiry,
      firstName: "",
      lastName: "",
      address: "",
      verified: false,
      lat: 0,
      lng: 0,
      orders: [],
    });

    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating user" });
    }

    // send OTP to customer
    await onRequestOTP(otp, phone);

    //Generate the Signature
    const signature = await GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });
    // Send the result
    return res
      .status(201)
      .json({
        token: signature,
        data: { verified: result.verified, email: result.email },
      });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const customerLogin = async (
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

export const customerVerify = async (
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

export const requestOtp = async (
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

export const getCustomerProfile = async (
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

export const editCustomerProfile = async (
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
