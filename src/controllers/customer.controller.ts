import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import {
  CartItem,
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
  GenerateOtp,
  onRequestOTP,
} from "../utility";
import {
  Customer,
  DeliveryUser,
  Food,
  Offer,
  Order,
  Transaction,
  Vendor,
} from "../models";

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
    const { txnId, amount, items } = <OrderInput>req.body;

    let cartItems = [];
    let netAmount = 0.0;

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not found" });
    }

    // create order id
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    const { status, currentTransaction } = await validateTransaction(txnId);

    if (!status) {
      return res.status(404).json({ message: "Error while Creating Order!" });
    }

    const profile = await Customer.findById(customer._id);
    let vendorId;
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "unable to create order" });
    }

    // calculate order amount
    const foods = await Food.find()
      .where("_id")
      .in(items.map((item) => item._id))
      .exec();

    foods.map((food) => {
      items.map(({ _id, unit }) => {
        if (food._id == _id) {
          vendorId = food.vendorId;
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
      vendorId: vendorId,
      items: cartItems,
      totalAmount: netAmount,
      paidAmount: amount,
      orderDate: new Date(),
      orderStatus: "Waiting",
      remarks: "",
      deliveryId: "",
      readyTime: 45,
    });

    // update order to user account
    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "error with create order" });
    }

    profile.cart = [] as any;

    // update transection
    currentTransaction.vendorId = vendorId;
    currentTransaction.orderId = orderId;
    currentTransaction.status = "CONFIRMED";

    await currentTransaction.save();

    profile.orders.push(order);

    const result = await assignOrderForDelivery(order._id, vendorId);
    console.log(result);
    if (result === false) {
      return res
        .status(400)
        .json({ success: false, message: "error with delivery the order" });
    }

    await profile.save();

    res.status(201).json({ success: true, data: profile });
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

    const { _id, unit } = <CartItem>req.body;

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
      } else {
        // add new items to cart
        cartItems.push({ food, unit });
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

export const verifyOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const offerId = req.params.id;

    const customer = req.user;

    if (!offerId) {
      return res
        .status(400)
        .json({ success: false, message: "offer id is missing" });
    }

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not valid" });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "no offer valid" });
    }

    if (offer.promoType === "USER") {
      // only apply once
    } else if (offer.isActive) {
      return res.status(200).json({ success: true, data: offer });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "no offer valid" });
    }
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;

    const { amount, paymentMode, offerId } = req.body;

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "customer not valid" });
    }

    let payableAmount = Number(amount);

    if (!offerId) {
      return res
        .status(400)
        .json({ success: false, message: "offer id is missing" });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "no offer valid" });
    }

    if (offer.isActive) {
      payableAmount = payableAmount - offer.offerAmount;
    }

    // create record on transaction
    const transaction = await Transaction.create({
      customer: customer._id,
      vendorId: "",
      orderId: "",
      orderValue: payableAmount,
      offerUsed: offerId || "NA",
      status: "OPEN",
      paymentMode: paymentMode,
      paymentResponse: "Payment is cash on Delivery",
    });

    //return transaction
    return res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message ? error.message : "Internal server error",
    });
  }
};

const validateTransaction = async (txnId: string) => {
  const currentTransaction = await Transaction.findById(txnId);

  if (currentTransaction) {
    if (currentTransaction.status.toLowerCase() !== "failed") {
      return { status: true, currentTransaction };
    }
  }
  return { status: false, currentTransaction };
};

/* ------------------- Delivery Notification --------------------- */

const assignOrderForDelivery = async (orderId: string, vendorId: string) => {
  // find the vendor
  const vendor = await Vendor.findById(vendorId);

  if (vendor) {
    const areaCode = vendor.pincode;
    const vendorLat = vendor.lat;
    const vendorLng = vendor.lng;

    //find the available Delivery person
    const deliveryPerson = await DeliveryUser.find({
      pincode: areaCode,
      verified: true,
      isAvailable: true,
    });
    if (!deliveryPerson.length) {
      return false;
    }

    // Check the nearest delivery person and assign the order

    const currentOrder = await Order.findById(orderId);
    if (currentOrder) {
      //update Delivery ID
      currentOrder.deliveryId = deliveryPerson[0]._id;
      await currentOrder.save();
      return true;

      //Notify to vendor for received new order firebase push notification
    }
  }
};
