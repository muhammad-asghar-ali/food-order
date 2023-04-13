import express from "express";
import {
  addToCart,
  createOrder,
  createPayment,
  customerLogin,
  customerSignup,
  customerVerify,
  deleteCart,
  editCustomerProfile,
  getAllOrders,
  getCart,
  getCustomerProfile,
  getOrderById,
  requestOtp,
  verifyOffer,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

/* ------------------- Suignup / Create Customer --------------------- */
router.post("/signup", customerSignup);

/* ------------------- Login --------------------- */
router.post("/login", customerLogin);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Verify Customer Account --------------------- */
router.patch("/verify", customerVerify);

/* ------------------- OTP / request OTP --------------------- */
router.get("/otp", requestOtp);

/* ------------------- Profile --------------------- */
router.get("/profile", getCustomerProfile);
router.patch("/profile", editCustomerProfile);

/* ------------------- Order --------------------- */
router.post("/create-order", createOrder);
router.get("/orders", getAllOrders);
router.get("/order/:id", getOrderById);

/* ------------------- Cart --------------------- */
router.post('/cart', addToCart)
router.get('/cart', getCart)
router.delete('/cart', deleteCart)

/* ------------------- Apply Offer --------------------- */
router.get("/offer/verify/:id", verifyOffer)

/* ------------------- Payment --------------------- */
router.post("/create-payment", createPayment)

export { router as CustomerRoutes };
