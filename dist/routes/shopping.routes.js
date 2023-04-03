"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingRoutes = void 0;
var express_1 = __importDefault(require("express"));
var controllers_1 = require("../controllers");
var router = express_1.default.Router();
exports.ShoppingRoutes = router;
/* ------------------- Food Availability --------------------- */
router.get("/:pincode", controllers_1.getFoodAvailability);
/* ------------------- Top Restaurant --------------------- */
router.get("/top-restaurant/:pincode", controllers_1.getTopRestaurants);
/* ------------------- Food Available in 30 Minutes --------------------- */
router.get("/foods-in-30-min/:pincode", controllers_1.getFoodsIn30Min);
/* ------------------- Search Foods --------------------- */
router.get("/search/:pincode", controllers_1.searchFoods);
/* ------------------- Search Offers --------------------- */
router.get("/offers/:pincode", controllers_1.getAvailableOffers);
/* ------------------- Find Restaurant by ID --------------------- */
router.get("/restaurant/:id", controllers_1.restaurantById);
//# sourceMappingURL=shopping.routes.js.map