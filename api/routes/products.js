import express from "express";
import multer from "multer";
import checkAuth from "../middleware/check-auth.js";
import {
  products_create_product,
  products_delete_product,
  products_get_all,
  products_get_product,
  products_update_product,
} from "../controllers/products.js";

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

router.get("/", products_get_all);

router.post(
  "/",
  checkAuth,
  upload.single("productImage"),
  products_create_product
);

router.get("/:productId", products_get_product);

router.patch("/:productId", checkAuth, products_update_product);

router.delete("/:productId", checkAuth, products_delete_product);

export default router;
