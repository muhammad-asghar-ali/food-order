import express from "express";
import {
  deliveryLogin,
  deliverySignUp,
  editDeliveryProfile,
  getDeliveryProfile,
  updateDeliveryUserStatus,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

/* ------------------- Signup / Create Customer --------------------- */
router.post("/signup", deliverySignUp);

/* ------------------- Login --------------------- */
router.post("/login", deliveryLogin);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Change Service Status --------------------- */
router.put("/change-status", updateDeliveryUserStatus);

/* ------------------- Profile --------------------- */
router.get("/profile", getDeliveryProfile);
router.patch("/profile", editDeliveryProfile);

export { router as DeliveryRoute };
