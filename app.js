import express from "express";
import productRoutes from "./api/routes/products.js";
import orderRoutes from "./api/routes/orders.js";
import userRoutes from "./api/routes/user.js";
import morgan from "morgan";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();

mongoose.connect(
  `mongodb+srv://MeetK:${process.env.MONGODB_ATLAS_PASSWORD}@rest-shop.zzoxnr8.mongodb.net/?retryWrites=true&w=majority`
);

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads/"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/user", userRoutes);

app.use((req, res, next) => {
  const error = new Error("Invalid path");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

export default app;
