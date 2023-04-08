import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInput,
  EditCustomerProfileInput,
  OrderInput,
  UserLoginInput,
} from "../dtos/customer.dto";
import { validate } from "class-validator";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility";
import { Customer, Food } from "../models";
import { GenerateOtp, onRequestOTP } from "../utility/notifications";
import { Order } from "../models/order.model";

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
    return res.status(201).json({
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
    const customerInputs = plainToClass(UserLoginInput, req.body);

    const validationError = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { email, password } = customerInputs;
    const customer = await Customer.findOne({ email: email });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (!validation) {
      return res
        .status(400)
        .json({ success: false, message: "error with login" });
    }

    const signature = GenerateSignature({
      _id: customer._id,
      email: customer.email,
      verified: customer.verified,
    });

    return res.status(200).json({
      token: signature,
      data: { email: customer.email, verified: customer.verified },
    });
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
    const { otp } = req.body;
    const customer = req.user;

    if (!otp) {
      return res.status(400).json({ success: false, message: "otp not found" });
    }

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to verify Customer" });
    }

    if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
      profile.verified = true;

      const updatedCustomer = await profile.save();

      const signature = GenerateSignature({
        _id: updatedCustomer._id,
        email: updatedCustomer.email,
        verified: updatedCustomer.verified,
      });

      return res.status(200).json({
        token: signature,
        data: {
          email: updatedCustomer.email,
          verified: updatedCustomer.verified,
        },
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "otp is not valid" });
    }
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
    const customer = req.user;

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to find Customer" });
    }

    const { otp, expiry } = GenerateOtp();
    profile.otp = otp;
    profile.otp_expiry = expiry;

    await profile.save();
    const sendCode = await onRequestOTP(otp, profile.phone);

    if (!sendCode) {
      return res
        .status(400)
        .json({ message: "Failed to verify your phone number" });
    }

    return res
      .status(200)
      .json({ message: "OTP sent to your registered Mobile Number!" });
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
    const customer = req.user;

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res
        .status(400)
        .json({ success: false, message: "Error while Fetching Profile" });
    }

    res.status(200).json({ success: true, data: profile });
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
    const customer = req.user;

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

    const validationError = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { firstName, lastName, address } = customerInputs;

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res
        .status(400)
        .json({ success: false, message: "Error while Updating Profile" });
    }

    profile.firstName = firstName || profile.firstName;
    profile.lastName = lastName || profile.lastName;
    profile.address = address || profile.address;
    const result = await profile.save();

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // current login customer

    const customer = req.user;

    // grap order from request body
    const cart = <[OrderInput]>req.body;

    let cartItems = [];
    let netAmount = 0.0;

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    // create order id
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "unable to create order" });
    }

    // calculate order amount
    const foods = await Food.find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();
    foods.map((food) => {
      cart.map(({ _id, unit }) => {
        if (food._id == _id) {
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    // create order with item description
    if (!cartItems) {
      return res
        .status(404)
        .json({ success: false, message: "cart not found" });
    }

    const order = await Order.create({
      orderId: orderId,
      items: cartItems,
      totalAmount: netAmount,
      orderDate: new Date(),
      paidThrough: "COD",
      paymentResponse: "",
      orderStatus: "Waiting",
    });

    // update order to user account
    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "error with create order" });
    }

    profile.orders.push(order);
    await profile.save();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    const profile = await Customer.findById(customer._id).populate("orders");

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found with order" });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "order id is missing in the params" });
    }

    const order = await Order.findById(orderId).populate("items.food");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // current login customer

    const customer = req.user;

    const { _id, unit } = <OrderInput>req.body;

    if (!_id || unit <= -1) {
      return res
        .status(400)
        .json({ success: false, message: "cart items are required" });
    }

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    const food = await Food.findById(_id);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "unable to cart the food" });
    }

    const profile = await Customer.findById(customer._id).populate("cart.food");

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "unable to create cart" });
    }

    let cartItems = [];
    cartItems = profile.cart;

    if (cartItems.length > 0) {
      // check and update cart
      const existFoodItem = cartItems.filter(
        (ele) => ele.food._id.toString() === _id
      );

      if (existFoodItem.length > 0) {
        // get the find food index
        const index = cartItems.indexOf(existFoodItem[0]);

        if (unit > 0) {
          // add unit to food
          cartItems[index] = { food, unit };
        } else {
          // remove food from cart
          cartItems.splice(index, 1);
        }
      }
    } else {
      // add new items to cart
      cartItems.push({ food, unit });
    }

    if (!cartItems) {
      return res
        .status(404)
        .json({ success: false, message: "unable to create cart" });
    }

    profile.cart = cartItems as any;
    const cartResult = await profile.save();
    
    return res.status(201).json({ success: true, data: cartResult.cart });

  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    const profile = await Customer.findById(customer._id).populate("cart.food");

    if (!profile) {
      return res.status(400).json({ success: false, message: "cart is empty" });
    }

    return res.status(200).json({ success: true, data: profile.cart });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const deleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    const profile = await Customer.findById(customer._id).populate("cart.food");

    if (!profile) {
      return res.status(400).json({ success: false, message: "cart is empty" });
    }

    profile.cart = [] as any;
    const cartResult = await profile.save();

    return res.status(200).json({ success: true, data: cartResult });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};
