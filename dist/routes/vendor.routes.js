"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRoutes = void 0;
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var controllers_1 = require("../controllers");
var middlewares_1 = require("../middlewares");
var multer_1 = __importDefault(require("multer"));
var router = express_1.default.Router();
exports.VendorRoutes = router;
var imageStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, "../images/"));
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    },
});
var images = (0, multer_1.default)({ storage: imageStorage }).array("images", 10);
router.post("/login", controllers_1.vendorLogin);
router.use(middlewares_1.Authenticate);
router.get("/profile", controllers_1.getVendorProfile);
router.patch("/profile", controllers_1.updateVendorProfile);
router.patch("/coverimage", images, controllers_1.updateVendorCoverImage);
router.patch("/service", controllers_1.updateVendorService);
router.post("/food", images, controllers_1.addFood);
router.get("/foods", controllers_1.getFoods);
router.get("/", function (req, res, next) {
    res.json({ message: "hello from vendor" });
});
//# sourceMappingURL=vendor.routes.js.map