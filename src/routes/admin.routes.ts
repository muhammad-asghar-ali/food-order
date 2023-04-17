import express, { Request, Response, NextFunction } from "express";
import { createVendor, getDeliveryUsers, getTransectionById, getTransections, getVendorById, getVendors, verifyDeliveryUser } from "../controllers";

const router = express.Router();

router.post("/vendor", createVendor);
router.get("/vendors", getVendors);
router.get("/vendor/:id", getVendorById);

router.get("/transections", getTransections);
router.get("/transection/:id", getTransectionById);

router.put('/delivery/verify', verifyDeliveryUser)
router.get('/delivery/users', getDeliveryUsers)


router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "hello from admin" });
});

export { router as AdminRoutes };
