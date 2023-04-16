import express from "express";
import {
  deliveryLogin,
  deliverySignUp,
  editDeliveryProfile,
  getDeliveryProfile,
<<<<<<< HEAD
  updateDeliveryUserStatus,
=======
>>>>>>> 9ccf2fe5fec97fd8dc47f08f49155993296a87f2
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
