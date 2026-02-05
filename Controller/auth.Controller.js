import { getUrlbyId, updateDb, deleteCode, getLinkCounts,
     setEmailValid, delTokens, getVerifyTokenRecord } from "../Model/model.js";

import { getUserByEmail, addToDb, validUser, redirectUserHomePage, 
    sendVerificationEmailLink, refreshProfile, setPassword, createResetPasswordLink,
     getResetPasswordToken, delPassTokens, 
     getUsersWithOauthId,
     linkedUserWithOauth,
     createUserwithOauth,
     getUserbyId,
     updateUserProfile} from "../services/auth.services.js";
// import { validUser } from "../services/auth.services.js";
// import { generateToken } from "../services/auth.services.js";
import {decodeIdToken, generateCodeVerifier, generateState} from "arctic";
import { db } from "../DrizzleORM/config/db.js";
import { sessionsTable, Users } from "../DrizzleORM/drizzle/schema.js";
import { eq } from "drizzle-orm";
import { emailSchema, passwordSchema,
 registerUserSchema, setPasswordSchema, userSchema } from "../Validator/auth.validation.js";
import { shortenerSchema } from "../Validator/shortner.validator.js";
import argon2  from "argon2";
import { getHtmlFromMjmlTempplate } from "../libv/get-html-from-mjml.js";
import { sendEmail } from "../libv/send-email.js";
import { OAUTH_EXCHANGE_EXPIRY } from "../config/constant.js";
import { google } from "../libv/oauth/google.js";
import { github } from "../libv/oauth/github.js";

// import { is } from "zod/v4/locales";
// import { email } from "zod";

// import { createSession,createAccessToken, createRefreshToken  } from "../services/auth.services.js";

export const getRegisterPage = (req, res) => {
    res.render("auth/register", { errors: req.flash("errors") });
}

export const getLoginPage = (req, res) => {
    res.render("auth/login", { errors: req.flash("errors") , success: req.flash("success") });
}

export const postLogin = async (req, res) => {
    if (req.user) return res.redirect("/");
    // res.setHeader("Set-Cookie","isLoggedIn=true; path=/;")
    const { email, password } = req.body;
    const result = await validUser({ email, password });
    
    if (!result.ok) {
        req.flash("errors", result.reason);
        return res.redirect("/login");

    }
    const data = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        is_email_valid: result.user.is_email_valid,
    }

    req.flash("success", result.reason);
    redirectUserHomePage(req, res, data);

    // return res.redirect("/");
}

export const postRegister = async (req, res) => {
    if (req.user) {
        req.flash("errors", "User with email Exists")
        return res.redirect("/");
    }

    const result = registerUserSchema.safeParse(req.body);

    if (!result.success) {
        const message = result.error.issues[0].message;
        req.flash("errors", message);
        return res.redirect("/register");
    }

    const data = result.data;
    const { name, email, password } = data;
    const exists = await getUserByEmail(email);
    if (exists.length > 0) {
        req.flash("errors", "User with email Exists")
        return res.redirect("/register");
    }
    const [regUser] = await addToDb({ name, email, password });

    const regData = {
        id: regUser.insertId,
        name,
        email,
        password,
        is_email_valid: false,
    }
    await sendVerificationEmailLink({ userId: regUser.insertId, email: regData.email });
    redirectUserHomePage(req, res, regData);
    // return res.redirect("/");
    // res.redirect("/login");
}

export const getProfile = async (req, res) => {
    if (!req.user){
        req.flash("errors", "Please login to access profile");
        return res.redirect("/login");
    }
    const [user]=await getUserbyId(req.user.id);
    const totLinks = await getLinkCounts(req.user.id);
    //    console.log("Total links for user:", totLinks);
    // console.log("req.user:", req.user);
    // console.log(user)
    const userInfo = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        hasPassword:Boolean(user.password),
        avatarUrl:user.avatarUrl,
        createdAt: totLinks.createdAt,
        linksCount: totLinks.count,
        isEmailValid: user.Validemail,

    }

    //    console.log("userInfo:",userInfo);
    return res.render("profile", { user: userInfo , success: req.flash("success"), errors: req.flash("errors")});
}

export const logoutUser = async (req, res) => {
    if (req.user?.sessionId) {
        // await db
        //   .update(sessionsTable)
        //   .set({ valid: false })
        //   .where(eq(sessionsTable.id, req.user.sessionId));

        await db.delete(sessionsTable).where(eq(sessionsTable.id, req.user.sessionId));
    }
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.redirect("/");
}

export const getEditPage = async (req, res) => {

    const links = await getUrlbyId(req.user.id, req.params.id)
    return res.render("edit", { link: links, id: req.params.id, errors: null });
}

export const postEdit = async (req, res) => {

    const result = shortenerSchema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.issues[0].message;
        req.flash("errors", message);

        return res.render("edit", {
            errors: message,
            id: req.params.id,
            link: {
                url: req.body.url,
                shortCode: req.body.shortCode
            }
        });
    }

    const updt = await updateDb(req.body.url, req.body.shortCode, req.params.id, req.user.id);
    return res.redirect("/");
}

export const deleteShortCode = async (req, res) => {
    try {
        const id = req.user.id;
        const linkId = req.params.id;
        await deleteCode(linkId, id);
        return res.redirect("/");
    }
    catch (error) {
        return res.status(500).send("Internal Server Error");
    }
}

export const verifyEmail = async (req, res) => {
    if (!req.user) return res.redirect("/login");
    const isEmailValid = req.user.isEmailValid;

    if (isEmailValid) {
        req.flash("success", "Email already verified.");
        return res.redirect("/");
    }
    res.render("auth/verifyEmail", { userId: req.user.id, email: req.user.email, error: req.flash("errors"), success: req.flash("success") });
}

export const resendVerificationEmail = async (req, res) => {
    if (!req.user) return res.redirect("/login");
    const isEmailValid = req.user.isEmailValid;
    if (isEmailValid) return res.redirect("/");

    await sendVerificationEmailLink({ userId: req.user.id, email: req.user.email });

    res.redirect("/verify-email");
}

export const verifyEmailToken = async (req, res) => {
    const { token, email, userId } = req.query;
    // console.log("Received token:", token, "email:", email);

    if (!token || !email) {
        return res.status(400).send("Invalid verification link");
    }

    const record = await getVerifyTokenRecord(token, userId);

    if (!record.length) {
        return res.status(400).send("Token invalid or expired");
    }
    // mark user as verified
    await setEmailValid(email);

    // delete token after use
    await delTokens(token);

    if (req.user) {
        refreshProfile(req, res);
        return res.redirect("/profile");
    }

    return res.redirect("/login");

};

export const verifyEmailTokenOtp = async (req, res) => {
    const { token, email, userId } = req.body;

    if (!token || !userId) {
        req.flash("errors", "Invalid token or email");
        return res.redirect("/verify-email");
    }

    const record = await getVerifyTokenRecord(token, userId);

    if (!record.length) {
        req.flash("errors", "Token invalid or expired");
        return res.redirect("/verify-email");
    }

    await setEmailValid(email);
    await delTokens(token);
    if (req.user) {
        refreshProfile(req, res);
        req.flash("success", "Email verified successfully.");
        return res.redirect("/profile");
    }
    return res.redirect("/login");
}

export const getEditProfilePage = async (req, res) => 
    {
        if(!req.user) return res.redirect("/login");
        const [user]=await getUserbyId(req.user.id);
        const {name,email}=req.user;

        return res.render("edit-profile",{name,email,avatarUrl:user.avatarUrl,errors:req.flash("errors"),success:req.flash("success")});

    }

export const postEditProfile = async (req, res) =>
{
    if(!req.user) return res.redirect("/login");
    // console.log("1",req.body.name);
    const {name}=req.body;
    const result=userSchema.safeParse({name});

    if(!result.success)
    {
        const message=result.error.issues[0].message;
        req.flash("errors",message);
        return res.redirect("/edit-profile");
    }
    

    // used when we only updated user name

    // await db
    // .update(Users)
    // .set({name:result.data.name})
    // .where(eq(Users.id,req.user.id));

    if (req.body.removeAvatar === 'true') {
    
    const user = await getUserbyId(req.user.id);
    if (user.avatarUrl) {
      fs.unlink(
        path.join(process.cwd(), 'public', user.avatarUrl),
        () => {}
      );
    }

    
    await updateUserProfile({userId:req.user.id,name:result.data.name,avatarUrl:null});
  }

    const fileUrl=req.file ? `uploads/avatars/${req.file.filename}` : undefined;

    await updateUserProfile({userId:req.user.id,name:result.data.name,avatarUrl:fileUrl});

    if(req.user)
    {
    refreshProfile(req,res,result.data.name);
    req.flash("success","Profile updated successfully");
    return res.redirect("/profile");
    }
    return res.redirect("/login");
}

export const getChangePasswordPage=async (req,res)=>
{

    return res.render("auth/change-password",{
        formSubmitted:req.flash("formSubmitted")[0],
        errors:req.flash("errors"),
        success:req.flash("success")
    });
}

export const postChangePassword=async (req,res)=>
{
    const {currentPassword,newPassword,confirmPassword}=req.body;
    // console.log("req.body",req.body);
    const result=passwordSchema.safeParse(req.body);

    if(!result.success)
    {
        const message=result.error.issues[0].message;
        req.flash("errors",message);
        return res.redirect("/change-password");
    }

    if(newPassword!==confirmPassword)
    {
        req.flash("errors","New password and confirm password do not match");
        return res.redirect("/change-password");
    }

    const response=await validUser({email:req.user.email,password:currentPassword});

    if(!response.ok)
    {
        req.flash("errors","Current password is incorrect");
        return res.redirect("/change-password");
    }

    await setPassword(req.user.id,newPassword);
   
    req.flash("success","Password changed successfully");
    return res.redirect("/");
}

export const getResetPasswordPage=async(req,res)=>
{
    
    return res.render("auth/reset-password",
    {errors:req.flash("errors"),success:req.flash("success"),formSubmitted:req.flash("formSubmitted")[0]}
    );
}

export const postResetPassword=async(req,res)=>
{
    const {email}=req.body;

    const result=emailSchema.safeParse({email});
    if(!result.success)
    {
        const message=result.error.issues[0].message;
        req.flash("errors",message);
        return res.redirect("/reset-password");
    }

    const [user]=await getUserByEmail(email);

    if(user)
    {
        const resetPasswordLink=await createResetPasswordLink({userId:user.id});
    const html=await getHtmlFromMjmlTempplate("reset-password-email",{
        name:user?.name||"User",
        link:resetPasswordLink
    });

    sendEmail({
        to:user.email,
        subject:"Reset your password",
        html,
    }).catch(console.error);
    // console.log(html);

    }
    req.flash("formSubmitted",true);
    return res.redirect("/reset-password");
};


export const getResetPasswordWithTokenPage=async(req,res)=>
{
    const {token}=req.params;
    // console.log("req:",req.params);
    const passwordResetRecord=await getResetPasswordToken(token);

    if(!token)
    {
        req.flash("errors","Invalid password reset link");
        return res.redirect("/reset-password");
    }
    if(!passwordResetRecord)
    {
        req.flash("errors","Password reset link expired or invalid");
        return res.redirect("/reset-password");
    }

    return res.render("auth/forgot-password-change",{
        formSubmitted:req.flash("formSubmitted")[0],
        errors:req.flash("errors"),
        success:req.flash("success"),
        token,
    })


}

export const postResetPasswordWithToken=async(req,res)=>
{
    const {token,newPassword,confirmPassword}=req.body;

    if(!token)
    {
        req.flash("errors","Invalid password reset link");
        return res.redirect("/reset-password");
    }
    const result=setPasswordSchema.safeParse({newPassword,confirmPassword});

    if(!result.success)
    {
        const message=result.error.issues[0].message;
        req.flash("errors",message);
        return res.redirect(`/reset-password/${token}`);
    }
    if(newPassword!==confirmPassword)
    {
        req.flash("errors","New password and confirm password do not match");
        return res.redirect(`/reset-password/${token}`);
    }
    const verifyToken=await getResetPasswordToken(token);

    if(!verifyToken)
    {
        req.flash("errors","Password reset link expired or invalid");
        return res.redirect("/reset-password");
    }

    await setPassword(verifyToken.userId,newPassword);

    // delete token after use
    await delPassTokens(verifyToken.userId);
    req.flash("success","Password reset successfully. You can now login with your new password.");
    return res.redirect("/login");
}

export const getGoogleLoginPage=async(req,res)=>
{
    if(req.user) return res.redirect("/");

    const state=generateState();
    const codeVerifier=generateCodeVerifier();

    const url=google.createAuthorizationURL(state,codeVerifier,[
        "openid", //generates a token
        "email",
        "profile" //it gives user profile info
    ]);

    const cookieConfig={
        httpOnly:true,
        secure:true,
        sameSite:"lax",
        maxAge:OAUTH_EXCHANGE_EXPIRY, //10 minutes
    };

    res.cookie("google_oauth_state",state,cookieConfig);
    res.cookie("google_code_verifier",codeVerifier,cookieConfig);
    // console.log(url)
    res.redirect(url.toString());

}

export const getGoogleLoginCallBack=async(req,res)=>
{
    const {code,state}=req.query;
    // console.log(code,state);

    const {
        google_oauth_state:storedState,
        google_code_verifier:codeVerifier}=req.cookies;

        if(!code || !state || !storedState || !codeVerifier || state!==storedState)
        {
            req.flash("errors","Couldn't login with google because of invalid login attempt,Please try again!");
            return res.redirect("/login");
        }

        let tokens;
        try {
            tokens=await google.validateAuthorizationCode(code,codeVerifier);
        } catch (error) {
            req.flash("errors","Couldn't login with google because of invalid login attempt,Please try again!");
            return res.redirect("/login");
        }

        const claims=decodeIdToken(tokens.idToken());
        const {sub:googleUserId,name,email}=claims;

        let user =await getUsersWithOauthId({
            provider:"google",
            email,
        });

        if(user && !user.providerAccountId)
        {
            await linkedUserWithOauth({
                UserId:user.id,
                provider:"google",
                providerAccountId:googleUserId,
            });
        }

        if(!user)
        {
            user=await createUserwithOauth({
                name,email,provider:"google",providerAccountId:googleUserId,
            })
        }


        req.flash("success","Logged in succesfully");
        await redirectUserHomePage(req, res, user)

}

export const getGithubLoginPage=async(req,res)=>
{

     if(req.user) return res.redirect("/");

    const state=generateState();
    // const codeVerifier=generateCodeVerifier(); not required in github

    const url=github.createAuthorizationURL(state,["user:email"]);

    const cookieConfig={
        httpOnly:true,
        secure:true,
        sameSite:"lax",
        maxAge:OAUTH_EXCHANGE_EXPIRY, //10 minutes
    };

    res.cookie("github_oauth_state",state,cookieConfig);
    // res.cookie("github",codeVerifier,cookieConfig); not required
    // console.log(url)
    res.redirect(url.toString());
}

export const getGithubLoginCallBack=async(req,res)=>
{
    const {code,state} =req.query;

    const {github_oauth_state:storedState}=req.cookies;

    function handleFailedLogin()
    {
        req.flash("errors",
            "Couldn't login with github because of nvalid login attempt,Please try again!");
            return res.redirect("/login");
    }

    if(!code || !state || !storedState || state!==storedState)
    {
        return handleFailedLogin();
    }

    let tokens;
    try {
       tokens = await github.validateAuthorizationCode(code);
    } catch (error) {
        return handleFailedLogin();
    }

    const githubUserResponse=await fetch("https://api.github.com/user",{
        headers:{
            Authorization:`Bearer ${tokens.accessToken()}`,
        },
    });

    if(!githubUserResponse.ok) return handleFailedLogin();

    const githubUser=await githubUserResponse.json();
    const {id:githubUserId,name}=githubUser;

    const githubEmailResponse = await fetch("https://api.github.com/user/emails",{
        headers:{
            Authorization:`Bearer ${tokens.accessToken()}`
        },
    });

    if(!githubEmailResponse.ok) return handleFailedLogin();

    const emails=await githubEmailResponse.json();
    // console.log("GitHub emails response:", emails);
    // const email = emails.find(e => e.primary)?.email;
    const email=emails.filter((e)=>e.primary)[0].email;

    if(!email) 
        {
            // console.log("email not found");
            return handleFailedLogin();
        }

    //  three ways to check user existence
    let user =await getUsersWithOauthId({
            provider:"github",
            email,
        });

        if(user && !user.providerAccountId)
        {
            await linkedUserWithOauth({
                UserId:user.id,
                provider:"github",
                providerAccountId:githubUserId,
            });
        }

        if(!user)
        {
            user=await createUserwithOauth({
                name,email,provider:"github",providerAccountId:githubUserId,
            })
        }

        req.flash("success","Logged in succesfully");
        await redirectUserHomePage(req, res, user)

}


export const getSetPasswordPage=async(req,res)=>
{
    if(!req.user) return res.redirect("/login");

    return res.render("auth/set-password",{errors:req.flash("errors"),success:req.flash("success")});
}

export const postSetPasswordPage=async(req,res)=>
{
    const {newPassword,confirmPassword}=req.body;
    // console.log(newPassword,"  ||   ",confirmPassword)
    const result=setPasswordSchema
    .safeParse({newPassword,confirmPassword});

    if(!result.success)
    {
        const message = result.error.issues[0].message;
        req.flash("errors",message);
        return res.redirect("/set-password");
    }

    // console.log("ok");
    await setPassword(req.user.id,newPassword);

    req.flash("success","Password set successfully");
    return res.redirect("/profile");

}