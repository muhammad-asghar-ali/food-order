"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoods = exports.addFood = exports.updateVendorService = exports.updateVendorCoverImage = exports.updateVendorProfile = exports.getVendorProfile = exports.vendorLogin = void 0;
var models_1 = require("../models");
var utility_1 = require("../utility");
var admin_controller_1 = require("./admin.controller");
var vendorLogin = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, alreadyExist, validate, signature, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "missing values in payload" })];
                }
                return [4 /*yield*/, (0, admin_controller_1.FindVendor)("", email)];
            case 1:
                alreadyExist = _b.sent();
                if (!alreadyExist) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "invaild credentails" })];
                }
                return [4 /*yield*/, (0, utility_1.ValidatePassword)(password, alreadyExist.password, alreadyExist.salt)];
            case 2:
                validate = _b.sent();
                if (!validate) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "invaild credentails" })];
                }
                signature = (0, utility_1.GenerateSignature)({
                    _id: alreadyExist._id,
                    name: alreadyExist.name,
                    email: alreadyExist.email,
                    foodType: alreadyExist.foodType,
                });
                res.status(200).json({ success: true, token: signature });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_1.message ? error_1.message : "Internal server error",
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.vendorLogin = vendorLogin;
var getVendorProfile = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, existingVendor, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                user = req.user;
                if (!user) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "vendor Information Not Found" })];
                }
                return [4 /*yield*/, (0, admin_controller_1.FindVendor)(user._id)];
            case 1:
                existingVendor = _a.sent();
                res.status(200).json({ success: true, data: existingVendor });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_2.message ? error_2.message : "Internal server error",
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getVendorProfile = getVendorProfile;
var updateVendorProfile = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, _a, foodType, name_1, address, phone, existingVendor, saveResult, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                user = req.user;
                _a = req.body, foodType = _a.foodType, name_1 = _a.name, address = _a.address, phone = _a.phone;
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            sucess: false,
                            message: "Unable to Update vendor profile",
                        })];
                }
                return [4 /*yield*/, (0, admin_controller_1.FindVendor)(user._id)];
            case 1:
                existingVendor = _b.sent();
                if (!existingVendor) return [3 /*break*/, 3];
                existingVendor.name = name_1 || existingVendor.name;
                existingVendor.address = address || existingVendor.address;
                existingVendor.phone = phone || existingVendor.phone;
                existingVendor.foodType = foodType || existingVendor.foodType;
                return [4 /*yield*/, existingVendor.save()];
            case 2:
                saveResult = _b.sent();
                res.status(200).json({
                    sucess: true,
                    data: saveResult,
                });
                _b.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                error_3 = _b.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_3.message ? error_3.message : "Internal server error",
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updateVendorProfile = updateVendorProfile;
var updateVendorCoverImage = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, vendor, files, images, saveResult;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                user = req.user;
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            sucess: false,
                            message: "Unable to update cover image",
                        })];
                }
                return [4 /*yield*/, (0, admin_controller_1.FindVendor)(user._id)];
            case 1:
                vendor = _b.sent();
                if (!vendor) {
                    return [2 /*return*/, res.status(400).json({
                            sucess: false,
                            message: "Unable to update cover image",
                        })];
                }
                files = req.files;
                images = files.map(function (file) { return file.filename; });
                (_a = vendor.coverImages).push.apply(_a, images);
                return [4 /*yield*/, vendor.save()];
            case 2:
                saveResult = _b.sent();
                return [2 /*return*/, res.json(saveResult)];
        }
    });
}); };
exports.updateVendorCoverImage = updateVendorCoverImage;
var updateVendorService = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, existingVendor, saveResult, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                user = req.user;
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            sucess: false,
                            message: "Unable to Update vendor profile",
                        })];
                }
                return [4 /*yield*/, (0, admin_controller_1.FindVendor)(user._id)];
            case 1:
                existingVendor = _a.sent();
                if (!existingVendor) return [3 /*break*/, 3];
                existingVendor.serviceAvailabilty = !existingVendor.serviceAvailabilty;
                return [4 /*yield*/, existingVendor.save()];
            case 2:
                saveResult = _a.sent();
                res.status(200).json({
                    sucess: true,
                    data: saveResult,
                });
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_4.message ? error_4.message : "Internal server error",
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updateVendorService = updateVendorService;
var addFood = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, _a, name_2, description, category, foodType, readyTime, price, vendor, files, images, food, result, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                user = req.user;
                _a = req.body, name_2 = _a.name, description = _a.description, category = _a.category, foodType = _a.foodType, readyTime = _a.readyTime, price = _a.price;
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            sucess: false,
                            message: "Unable to create food",
                        })];
                }
                return [4 /*yield*/, (0, admin_controller_1.FindVendor)(user._id)];
            case 1:
                vendor = _b.sent();
                if (!vendor) return [3 /*break*/, 4];
                files = req.files;
                images = files.map(function (file) { return file.filename; });
                return [4 /*yield*/, models_1.Food.create({
                        vendorId: vendor._id,
                        name: name_2,
                        description: description,
                        category: category,
                        price: price,
                        rating: 0,
                        readyTime: readyTime,
                        foodType: foodType,
                        images: images,
                    })];
            case 2:
                food = _b.sent();
                vendor.foods.push(food);
                return [4 /*yield*/, vendor.save()];
            case 3:
                result = _b.sent();
                return [2 /*return*/, res.status(200).json({ sucess: true, data: result })];
            case 4: return [2 /*return*/, res.status(404).json({
                    sucess: false,
                    message: "vendor not found",
                })];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_5 = _b.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_5.message ? error_5.message : "Internal server error",
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.addFood = addFood;
var getFoods = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, foods, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                user = req.user;
                if (!user) {
                    return [2 /*return*/, res.status(400).json({
                            sucess: false,
                            message: "Unable to get foods",
                        })];
                }
                return [4 /*yield*/, models_1.Food.find({ vendorId: user._id }).lean()];
            case 1:
                foods = _a.sent();
                if (!foods.length) {
                    return [2 /*return*/, res.status(400).json({
                            sucess: false,
                            message: "Unable to get foods",
                        })];
                }
                res.status(200).json({ sucess: true, data: foods });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_6.message ? error_6.message : "Internal server error",
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getFoods = getFoods;
//# sourceMappingURL=vendor.controller.js.map