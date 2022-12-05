import express from "express";
import mongoose, { mongo } from "mongoose";
import Order from "../models/order.js";
import Product from "../models/product.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product", "name")
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        order: docs.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: `http://localhost:3000/${doc._id}`,
            },
          };
        }),
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

router.post("/", async (req, res, next) => {
  try {
    const product = await Product.findById(req.body.productId).exec();

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      product: req.body.productId,
      quantity: req.body.quantity,
    });
    const result = await order.save();
    console.log(result);
    res.status(201).json({
      message: "Order created",
      createdOrder: {
        _id: result._id,
        product: result.product,
        quantity: result.quantity,
      },
      request: {
        type: "GET",
        url: `http://localhost:3000/${result._id}`,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error,
    });
  }
});

router.get("/:orderId", (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate("product", "name")
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          description: "Get all orders",
          url: "http://localhost:3000/orders",
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

router.delete("/:orderId", (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Order deleted successfully",
        request: {
          type: "POST",
          description: "Create an orders",
          url: "http://localhost:3000/orders",
          body: { productId: "Product ID", quantity: "Number" },
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

export default router;
