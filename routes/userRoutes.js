import {Router} from "express";
import {register, login, logout, getProfile, forgetPassword, resetPassword, changePassword, updateUser} from "../controllers/userControllers.js"
import { isLoggedIn } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router= Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", isLoggedIn, getProfile);
router.post("/forget-password", forgetPassword);
router.post("/reset/:resetToken", resetPassword);
router.post("/change-password",isLoggedIn, changePassword);
router.put("/update-user", isLoggedIn, updateUser);

export default router;
