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
exports.editCustomerProfile = exports.getCustomerProfile = exports.requestOtp = exports.customerVerify = exports.customerLogin = exports.customerSignup = void 0;
var class_transformer_1 = require("class-transformer");
var customer_dto_1 = require("../dtos/customer.dto");
var class_validator_1 = require("class-validator");
var utility_1 = require("../utility");
var models_1 = require("../models");
var notifications_1 = require("../utility/notifications");
var customerSignup = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customerInputs, validationError, email, phone, password, salt, userPassword, _a, otp, expiry, existingCustomer, result, signature, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                customerInputs = (0, class_transformer_1.plainToClass)(customer_dto_1.CreateCustomerInput, req.body);
                return [4 /*yield*/, (0, class_validator_1.validate)(customerInputs, {
                        validationError: { target: true },
                    })];
            case 1:
                validationError = _b.sent();
                if (validationError.length > 0) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: validationError })];
                }
                email = customerInputs.email, phone = customerInputs.phone, password = customerInputs.password;
                return [4 /*yield*/, (0, utility_1.GenerateSalt)()];
            case 2:
                salt = _b.sent();
                return [4 /*yield*/, (0, utility_1.GeneratePassword)(password, salt)];
            case 3:
                userPassword = _b.sent();
                _a = (0, notifications_1.GenerateOtp)(), otp = _a.otp, expiry = _a.expiry;
                return [4 /*yield*/, models_1.Customer.findOne({ email: email })];
            case 4:
                existingCustomer = _b.sent();
                if (existingCustomer !== null) {
                    return [2 /*return*/, res
                            .status(409)
                            .json({ success: false, message: "Email already exist!" })];
                }
                return [4 /*yield*/, models_1.Customer.create({
                        email: email,
                        password: userPassword,
                        salt: salt,
                        phone: phone,
                        otp: otp,
                        otp_expiry: expiry,
                        firstName: "",
                        lastName: "",
                        address: "",
                        verified: false,
                        lat: 0,
                        lng: 0,
                        orders: [],
                    })];
            case 5:
                result = _b.sent();
                if (!result) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "Error while creating user" })];
                }
                // send OTP to customer
                return [4 /*yield*/, (0, notifications_1.onRequestOTP)(otp, phone)];
            case 6:
                // send OTP to customer
                _b.sent();
                return [4 /*yield*/, (0, utility_1.GenerateSignature)({
                        _id: result._id,
                        email: result.email,
                        verified: result.verified,
                    })];
            case 7:
                signature = _b.sent();
                // Send the result
                return [2 /*return*/, res.status(201).json({
                        token: signature,
                        data: { verified: result.verified, email: result.email },
                    })];
            case 8:
                error_1 = _b.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_1.message ? error_1.message : "Internal server error",
                });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.customerSignup = customerSignup;
var customerLogin = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customerInputs, validationError, email, password, customer, validation, signature, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                customerInputs = (0, class_transformer_1.plainToClass)(customer_dto_1.UserLoginInput, req.body);
                return [4 /*yield*/, (0, class_validator_1.validate)(customerInputs, {
                        validationError: { target: true },
                    })];
            case 1:
                validationError = _a.sent();
                if (validationError.length > 0) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: validationError })];
                }
                email = customerInputs.email, password = customerInputs.password;
                return [4 /*yield*/, models_1.Customer.findOne({ email: email })];
            case 2:
                customer = _a.sent();
                if (!customer) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "customer not found" })];
                }
                return [4 /*yield*/, (0, utility_1.ValidatePassword)(password, customer.password, customer.salt)];
            case 3:
                validation = _a.sent();
                if (!validation) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "error with login" })];
                }
                signature = (0, utility_1.GenerateSignature)({
                    _id: customer._id,
                    email: customer.email,
                    verified: customer.verified,
                });
                return [2 /*return*/, res.status(200).json({
                        token: signature,
                        data: { email: customer.email, verified: customer.verified },
                    })];
            case 4:
                error_2 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_2.message ? error_2.message : "Internal server error",
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.customerLogin = customerLogin;
var customerVerify = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var otp, customer, profile, updatedCustomer, signature, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                otp = req.body.otp;
                customer = req.user;
                if (!otp) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: "otp not found" })];
                }
                if (!customer) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "customer not found" })];
                }
                return [4 /*yield*/, models_1.Customer.findById(customer._id)];
            case 1:
                profile = _a.sent();
                if (!profile) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "Unable to verify Customer" })];
                }
                if (!(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date())) return [3 /*break*/, 3];
                profile.verified = true;
                return [4 /*yield*/, profile.save()];
            case 2:
                updatedCustomer = _a.sent();
                signature = (0, utility_1.GenerateSignature)({
                    _id: updatedCustomer._id,
                    email: updatedCustomer.email,
                    verified: updatedCustomer.verified,
                });
                return [2 /*return*/, res.status(200).json({
                        token: signature,
                        data: {
                            email: updatedCustomer.email,
                            verified: updatedCustomer.verified,
                        },
                    })];
            case 3: return [2 /*return*/, res
                    .status(400)
                    .json({ success: false, message: "otp is not valid" })];
            case 4: return [3 /*break*/, 6];
            case 5:
                error_3 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_3.message ? error_3.message : "Internal server error",
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.customerVerify = customerVerify;
var requestOtp = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customer, profile, _a, otp, expiry, sendCode, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                customer = req.user;
                if (!customer) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "customer not found" })];
                }
                return [4 /*yield*/, models_1.Customer.findById(customer._id)];
            case 1:
                profile = _b.sent();
                if (!profile) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "Unable to find Customer" })];
                }
                _a = (0, notifications_1.GenerateOtp)(), otp = _a.otp, expiry = _a.expiry;
                profile.otp = otp;
                profile.otp_expiry = expiry;
                return [4 /*yield*/, profile.save()];
            case 2:
                _b.sent();
                return [4 /*yield*/, (0, notifications_1.onRequestOTP)(otp, profile.phone)];
            case 3:
                sendCode = _b.sent();
                if (!sendCode) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ message: "Failed to verify your phone number" })];
                }
                return [2 /*return*/, res
                        .status(200)
                        .json({ message: "OTP sent to your registered Mobile Number!" })];
            case 4:
                error_4 = _b.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_4.message ? error_4.message : "Internal server error",
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.requestOtp = requestOtp;
var getCustomerProfile = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customer, profile, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                customer = req.user;
                if (!customer) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "customer not found" })];
                }
                return [4 /*yield*/, models_1.Customer.findById(customer._id)];
            case 1:
                profile = _a.sent();
                if (!profile) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "Error while Fetching Profile" })];
                }
                res.status(200).json({ success: true, data: profile });
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
exports.getCustomerProfile = getCustomerProfile;
var editCustomerProfile = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var customer, customerInputs, validationError, firstName, lastName, address, profile, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                customer = req.user;
                if (!customer) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ success: false, message: "customer not found" })];
                }
                customerInputs = (0, class_transformer_1.plainToClass)(customer_dto_1.EditCustomerProfileInput, req.body);
                return [4 /*yield*/, (0, class_validator_1.validate)(customerInputs, {
                        validationError: { target: true },
                    })];
            case 1:
                validationError = _a.sent();
                if (validationError.length > 0) {
                    return [2 /*return*/, res.status(400).json({ success: false, message: validationError })];
                }
                firstName = customerInputs.firstName, lastName = customerInputs.lastName, address = customerInputs.address;
                return [4 /*yield*/, models_1.Customer.findById(customer._id)];
            case 2:
                profile = _a.sent();
                if (!profile) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ success: false, message: "Error while Updating Profile" })];
                }
                profile.firstName = firstName || profile.firstName;
                profile.lastName = lastName || profile.lastName;
                profile.address = address || profile.address;
                return [4 /*yield*/, profile.save()];
            case 3:
                result = _a.sent();
                res.status(200).json({ success: true, result: result });
                return [3 /*break*/, 5];
            case 4:
                error_6 = _a.sent();
                res.status(500).json({
                    sucess: false,
                    message: error_6.message ? error_6.message : "Internal server error",
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.editCustomerProfile = editCustomerProfile;
//# sourceMappingURL=customer.controller.js.map