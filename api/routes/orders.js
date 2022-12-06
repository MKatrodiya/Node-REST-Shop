import express from "express";
import {
  orders_create_order,
  orders_delete_order,
  orders_get_all,
  orders_get_order,
} from "../controllers/orders.js";
import checkAuth from "../middleware/check-auth.js";

const router = express.Router();

router.get("/", checkAuth, orders_get_all);

router.post("/", checkAuth, orders_create_order);

router.get("/:orderId", checkAuth, orders_get_order);

router.delete("/:orderId", checkAuth, orders_delete_order);

export default router;
