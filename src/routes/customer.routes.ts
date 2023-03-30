import express from "express";
import {
  customerLogin,
  customerSignup,
  customerVerify,
  editCustomerProfile,
  getCustomerProfile,
  requestOtp,
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

export { router as CustomerRoutes };
