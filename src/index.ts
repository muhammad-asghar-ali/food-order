import express from "express";
import mongoose from "mongoose";
import { MONGO_URI } from "./config";
import { AdminRoutes, VendorRoutes } from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/admin", AdminRoutes);
app.use("/vendor", VendorRoutes);

mongoose
  .connect(MONGO_URI)
  .then((result) => console.log("db connected"))
  .catch((err) => console.log("error" + err));

app.listen(8000, () => {
  console.log("app is ruunnig on http://localhost:8000");
});
