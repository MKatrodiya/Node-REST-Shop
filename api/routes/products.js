import express from "express";
import mongoose from "mongoose";
import Product from "../models/product.js";
import multer from "multer";
import checkAuth from "../middleware/check-auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toDateString() + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter,
});

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            ...doc._doc,
            request: {
              type: "GET",
              url: `http://localhost:3000/products/${doc._id}`,
            },
          };
        }),
      };
      // if (docs.length > 1) {
      res.status(200).json(response);
      // } else {
      //   res.status(404).json({
      //     message: "No documents found",
      //   });
      // }
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created product successfully",
        createdProduct: {
          name: product.name,
          price: product.price,
          _id: product._id,
          productImage: product.productImage,
          request: {
            type: "GET",
            url: `http://localhost:3000/products/${product._id}`,
          },
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: "GET",
            description: "Get all the products",
            url: "https://localhost:3000/products",
          },
        });
      } else {
        res.status(404).json({
          message: "No valid entry found for provided id",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

router.patch("/:productId", checkAuth, (req, res, next) => {
  const productId = req.params.productId;
  const updateProps = {};
  for (const prop of req.body) {
    updateProps[prop.propName] = prop.value;
  }
  Product.updateOne({ _id: productId }, { $set: updateProps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Product updated successfully",
        request: {
          type: "GET",
          url: `http://localhost:3000/products/${productId}`,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

router.delete("/:productId", checkAuth, (req, res, next) => {
  const productId = req.params.productId;
  Product.deleteOne({ _id: productId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Product deleted successfully",
        request: {
          type: "POST",
          url: `http://localhost:3000/products`,
          body: { name: "String", price: "Number" },
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

export default router;
