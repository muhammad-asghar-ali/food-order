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
exports.getAvailableOffers = exports.restaurantById = exports.searchFoods = exports.getFoodsIn30Min = exports.getTopRestaurants = exports.getFoodAvailability = void 0;
var models_1 = require("../models");
var getFoodAvailability = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var pincode, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                pincode = req.params.pincode;
                if (!pincode) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "pincode in missing",
                        })];
                }
                return [4 /*yield*/, models_1.Vendor.find({
                        pincode: pincode,
                        serviceAvailabilty: true,
                    })
                        .sort([["rating", "descending"]])
                        .populate("foods")];
            case 1:
                result = _a.sent();
                if (result.length === 0) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "data Not found!" })];
                }
                res.status(200).json({ success: true, data: result });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_1.message ? error_1.message : "Internal server error",
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getFoodAvailability = getFoodAvailability;
var getTopRestaurants = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var pincode, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                pincode = req.params.pincode;
                if (!pincode) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "pincode in missing",
                        })];
                }
                return [4 /*yield*/, models_1.Vendor.find({
                        pincode: pincode,
                        serviceAvailabilty: true,
                    })
                        .sort([["rating", "descending"]])
                        .limit(10)];
            case 1:
                result = _a.sent();
                if (result.length === 0) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "data Not found!" })];
                }
                res.status(200).json({ success: true, data: result });
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
exports.getTopRestaurants = getTopRestaurants;
var getFoodsIn30Min = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var pincode, result, foodResult_1, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                pincode = req.params.pincode;
                if (!pincode) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "pincode in missing",
                        })];
                }
                return [4 /*yield*/, models_1.Vendor.find({
                        pincode: pincode,
                        serviceAvailabilty: true,
                    }).populate("foods")];
            case 1:
                result = _a.sent();
                if (result.length === 0) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "data Not found!" })];
                }
                foodResult_1 = [];
                result.map(function (vendor) {
                    if (!vendor.foods) {
                    }
                    else {
                        var foods = vendor.foods;
                        foodResult_1.push.apply(foodResult_1, foods.filter(function (food) { return food.readyTime <= 30; }));
                    }
                });
                res.status(200).json({ success: true, data: foodResult_1 });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_3.message ? error_3.message : "Internal server error",
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getFoodsIn30Min = getFoodsIn30Min;
var searchFoods = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var pincode, result, foodResult_2, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                pincode = req.params.pincode;
                if (!pincode) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "pincode in missing",
                        })];
                }
                return [4 /*yield*/, models_1.Vendor.find({
                        pincode: pincode,
                        serviceAvailabilty: true,
                    }).populate("foods")];
            case 1:
                result = _a.sent();
                if (result.length === 0) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "data Not found!" })];
                }
                foodResult_2 = [];
                result.map(function (vendor) {
                    // remove null vendor w ith null foods
                    foodResult_2.push.apply(foodResult_2, vendor.foods);
                });
                res.status(200).json({ success: true, data: foodResult_2 });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_4.message ? error_4.message : "Internal server error",
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.searchFoods = searchFoods;
var restaurantById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                if (!id) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "id in missing",
                        })];
                }
                return [4 /*yield*/, models_1.Vendor.findById(id).populate("foods")];
            case 1:
                result = _a.sent();
                if (!result) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "data Not found!" })];
                }
                res.status(200).json({ success: true, data: result });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_5.message ? error_5.message : "Internal server error",
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.restaurantById = restaurantById;
var getAvailableOffers = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
        }
        catch (error) {
            res.status(500).json({
                sucess: false,
                message: error.message ? error.message : "Internal server error",
            });
        }
        return [2 /*return*/];
    });
}); };
exports.getAvailableOffers = getAvailableOffers;
//# sourceMappingURL=shopping.controller.js.map