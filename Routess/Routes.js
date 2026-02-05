import path from 'path';
import { postShortend } from '../Controller/control.js';
import { fileURLToPath } from 'url';
import { getInterface } from '../views/view.js';
import {Router} from 'express'
import express from 'express';
import multer from 'multer';
import { redirectLinks } from '../Model/codeFetch.js';
import * as authControllers from '../Controller/auth.Controller.js';

const router=Router();
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
export const R_DIR=ROOT_DIR;




router.get("/",getInterface)

router.use(express.static(path.join(ROOT_DIR,"public")));

router.route("/resend-verification").get(authControllers.resendVerificationEmail);

router.route("/set-password").get(authControllers.getSetPasswordPage).post(authControllers.postSetPasswordPage)
router.route("/change-password").get(authControllers.getChangePasswordPage).post(authControllers.postChangePassword);
router.route("/reset-password/:token").get(authControllers.getResetPasswordWithTokenPage).post(authControllers.postResetPasswordWithToken);
router.route("/reset-password").get(authControllers.getResetPasswordPage).post(authControllers.postResetPassword);

const avatarStorage=multer.diskStorage({
    destination:(req,file,cb)=>
{
    cb(null,"public/uploads/avatars");
},
filename:(req,file,cb)=>
{
    const ext=path.extname(file.originalname);
    cb(null,`${Date.now()}_${Math.random()}${ext}`);
},
});

const avatarFileFilter=(req,file,cb)=>
{
    if(file.mimetype.startsWith("image/")){
        cb(null,true);
    }
    else{
        cb(new Error("Only image files are allowed!"),false);
    }
};

const avatarUpload=multer({
    storage:avatarStorage,
    fileFilter:avatarFileFilter,
    limits:{fileSize:5*1024*1024},
});

router.route("/verify-email-token").get(authControllers.verifyEmailToken).post(authControllers.verifyEmailTokenOtp);
router.route("/edit-profile").get(authControllers.getEditProfilePage)
.post(avatarUpload.single("avatar"),authControllers.postEditProfile)
// .post(authControllers.postEditProfile);
router.route("/delete/:id").post(authControllers.deleteShortCode);
router.route("/edit/:id").get(authControllers.getEditPage).post(authControllers.postEdit);
router.route("/verify-email").get(authControllers.verifyEmail);
router.post("/shorten", postShortend);
router.get("/:code",redirectLinks);




export const Shortened=router;