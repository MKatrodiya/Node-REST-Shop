import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length !== 0) {
        return res.status(409).json({
          message: "User already exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json({
                  message: "User created",
                });
              })
              .catch((error) => {
                console.log(error);
                res.status(500).json({
                  error,
                });
              });
          }
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error,
      });
    });
});

router.post("/signin", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user) {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Authentication failed",
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user.email,
                _id: user._id,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "1h",
              }
            );
            return res.status(200).json({
              message: "Authentication successful",
              token,
            });
          }
          return res.status(401).json({
            message: "Authentication failed",
          });
        });
      } else {
        res.status(401).json({
          message: "Authentication failed",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error,
      });
    });
});

router.delete("/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error,
      });
    });
});

export default router;
