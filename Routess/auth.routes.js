import {Router} from 'express';
import * as authControllers from "../Controller/auth.Controller.js"

const router=Router();

router.route("/register").get(authControllers.getRegisterPage).post(authControllers.postRegister);
// router.post("/register", authControllers.postRegister);
// router.get("/login",authControllers.getLoginPage);
// router.post("/login",authControllers.postLogin);
router.route("/login").get(authControllers.getLoginPage).post(authControllers.postLogin);
router.route("/logout").get(authControllers.logoutUser);
router.route("/profile").get(authControllers.getProfile);

export const authRoutes=router;