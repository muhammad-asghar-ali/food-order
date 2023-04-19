import express, { Request, Response, NextFunction } from "express";
import path from "path";
import {
  addFood,
  addOffer,
  deleteOffer,
  editOffer,
  getCurrentOrders,
  getFoods,
  getOffer,
  getOffers,
  getOrderDetails,
  getVendorProfile,
  processOrder,
  updateVendorCoverImage,
  updateVendorProfile,
  updateVendorService,
  vendorLogin,
} from "../controllers";
import { Authenticate } from "../middlewares";
import multer from "multer";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images/"));
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.post("/login", vendorLogin);

router.use(Authenticate);
router.get("/profile", getVendorProfile);
router.patch("/profile", updateVendorProfile);
router.patch("/coverimage", images, updateVendorCoverImage);
router.patch("/service", updateVendorService);

router.post("/food", images, addFood);
router.get("/foods", getFoods);

// order
router.get("/orders", getCurrentOrders);
router.put("/order/:id/process", processOrder);
router.get("/order/:id", getOrderDetails);

// Offers
router.post("/offer", addOffer);
router.get("/offers", getOffers);
router.put("/offer/:id", editOffer);
router.get("/offer/:id", getOffer);
router.delete("/offer/:id", deleteOffer);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "hello from vendor" });
});

export { router as VendorRoutes };
