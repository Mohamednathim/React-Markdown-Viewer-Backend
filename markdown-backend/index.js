import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { UserRouter } from "./Routes/UserRoute.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", UserRouter);

app.get("/", (req, res) => {
  res.json({ messege: "Hi,EveryOne...🖐🏻" });
});

const PORT = process.env.PORT;
const DB_CONNECTION = process.env.DB_CONNECTION;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(DB_CONNECTION);
    console.log("Connected to the mongoDB");
    return connection;
  } catch (error) {
    console.log(error);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Server started on localhost: ${PORT}`);
});
