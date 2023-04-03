"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRoutes = void 0;
var express_1 = __importDefault(require("express"));
var controllers_1 = require("../controllers");
var middlewares_1 = require("../middlewares");
var router = express_1.default.Router();
exports.CustomerRoutes = router;
/* ------------------- Suignup / Create Customer --------------------- */
router.post("/signup", controllers_1.customerSignup);
/* ------------------- Login --------------------- */
router.post("/login", controllers_1.customerLogin);
/* ------------------- Authentication --------------------- */
router.use(middlewares_1.Authenticate);
/* ------------------- Verify Customer Account --------------------- */
router.patch("/verify", controllers_1.customerVerify);
/* ------------------- OTP / request OTP --------------------- */
router.get("/otp", controllers_1.requestOtp);
/* ------------------- Profile --------------------- */
router.get("/profile", controllers_1.getCustomerProfile);
router.patch("/profile", controllers_1.editCustomerProfile);
//# sourceMappingURL=customer.routes.js.map