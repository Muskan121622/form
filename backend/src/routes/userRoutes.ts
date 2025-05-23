import express from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/usercontroller";

const router = express.Router();


// Validation middleware
const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];
// POST /api/users/register
router.post("/register", validateRegister, register);


// POST /api/users/login
router.post("/login",validateLogin, login);

export default router;
