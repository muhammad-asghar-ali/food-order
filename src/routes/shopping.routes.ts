import express from "express";
import {
  getAvailableOffers,
  getFoodAvailability,
  getFoodsIn30Min,
  getTopRestaurants,
  restaurantById,
  searchFoods,
} from "../controllers";

const router = express.Router(); 

/* ------------------- Food Availability --------------------- */
router.get("/:pincode", getFoodAvailability);

/* ------------------- Top Restaurant --------------------- */
router.get("/top-restaurant/:pincode", getTopRestaurants);

/* ------------------- Food Available in 30 Minutes --------------------- */
router.get("/foods-in-30-min/:pincode", getFoodsIn30Min);

/* ------------------- Search Foods --------------------- */
router.get("/search/:pincode", searchFoods);

/* ------------------- Search Offers --------------------- */
router.get("/offers/:pincode", getAvailableOffers);

/* ------------------- Find Restaurant by ID --------------------- */
router.get("/restaurant/:id", restaurantById);

export { router as ShoppingRoutes };
