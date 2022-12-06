import express from "express";
import { user_delete, user_signin, user_signup } from "../controllers/users.js";
import checkAuth from "../middleware/check-auth.js";

const router = express.Router();

router.post("/signup", user_signup);

router.post("/signin", user_signin);

router.delete("/:userId", checkAuth, user_delete);

export default router;
