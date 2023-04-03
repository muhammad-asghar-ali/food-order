import dotenv from "dotenv";

dotenv.config();

export const MONGO_URI= process.env.DB
// "mongodb://localhost:27017/online_food";
export const PORT = process.env.PORT
export const APP_SECRET="dhfjkdshfdslkfhdskf";