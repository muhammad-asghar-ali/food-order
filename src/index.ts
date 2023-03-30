import express from 'express';
import App from './services/express';
import dbConnection from './services/Database';
import { PORT } from './config';
import dotenv from 'dotenv';

dotenv.config()

const StartServer = async () => {

    const app = express();

    await dbConnection()

    await App(app);

    app.listen(PORT, () => {
        console.log(`Listening to port ${PORT}`);
    })
}

StartServer();


// import express from "express";
// import mongoose from "mongoose";
// import path from "path";
// import { MONGO_URI } from "./config";
// import { AdminRoutes, VendorRoutes } from "./routes";

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true, limit: "20mb" }));
// app.use('/images', express.static(path.join(__dirname, '../src/images/')));

// app.use("/admin", AdminRoutes);
// app.use("/vendor", VendorRoutes);

// mongoose
//   .connect(MONGO_URI)
//   .then((result) => console.log("db connected"))
//   .catch((err) => console.log("error" + err));

// app.listen(8000, () => {
//   console.log("app is ruunnig on http://localhost:8000");
// });
