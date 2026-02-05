import { oauthAccountsTable, passwordResetTokensTable, sessionsTable, Users, VerifyEmailTokens } from "../DrizzleORM/drizzle/schema.js";
import {db} from "../DrizzleORM/config/db.js"
import { and, eq, gt,lt } from "drizzle-orm";
// import { sendEmail } from "../libv/nodemailer.js";
import { sendEmail } from "../libv/send-email.js";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import dotenv from "dotenv";
import crypto, { verify } from "crypto";
import fs from "fs/promises";
import path from "path";
import ejs from "ejs";
import mjml2html from "mjml";
import { TOKEN_AGE, TOKEN_EXPIRE_TIME } from "../config/constant.js";

dotenv.config();

export const getUserByEmail=async(email)=>
{
const res=await db.select().from(Users).where(eq(Users.email,email));
// console.log(res);
return res;
}

export const getUserbyId=async(id)=>
{
    return await db.select().from(Users).where(eq(Users.id,id));
}

export const addToDb=async({name,email,password})=>
{
     const hashedPassword = await argon2.hash(password);

return db.insert(Users).values({name:name,email:email,password:hashedPassword});
}

export const validUser=async({email,password})=>
{
    const users=await getUserByEmail(email); //returns an array
    if (users.length === 0) {
        return { ok: false, reason: "INVALID_PASSWORD OR  USER NOT EXISTS" };
    }
    
    const user = users[0];
    // console.log(user);
        console.log("Verifying password for user:", user);
     const isMatch = await argon2.verify(user.password,password);
    if (!isMatch) {
        return { ok: false, reason: "INVALID_PASSWORD OR USER NOT EXISTS" };
    }
    // console.log("-----------------User validated successfully---------------");
    return {
        ok: true,
        reason:"Logged in successfully",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            is_email_valid: user.Validemail,
        }
    }  //here we can return entire user too instead of being specific.
};  


export const generateToken=({id,email,name})=>
{
    // console.log(process.env.SECRET_KEY);
    return jwt.sign({id,email,name},process.env.SECRET_KEY,{expiresIn:"1h"});
}


// export const createSession=async(userId,{ip,userAgent})=>
// {
//     const [session]=await db.insert(sessionsTable).values({userId,ip,userAgent}).returning({ id: sessionsTable.id });;
//     console.log("Created session with ID:", session);
//     return  session.id;

// }

export const createSession = async (userId, { ip, userAgent }) => {
  const [result] = await db
    .insert(sessionsTable)
    .values({ userId, ip, userAgent });
// console.log("Session creation result:", result);
  // MySQL / SQLite way
  const sessionId = result.insertId;

  if (!sessionId) {
    throw new Error("Failed to create session");
  }

//   console.log("Created session with ID:", sessionId);
  return sessionId;
};

// export const createAccessToken=({id,email,name,sessionId,isEmailValid})=>
// {
//     return jwt.sign({id,email,name,sessionId,isEmailValid},process.env.SECRET_KEY,{expiresIn:"15m"});
// }

export const createAccessToken = ({id,email,name,sessionId,isEmailValid}) => {
  return jwt.sign(
    { id, email, name, sessionId, isEmailValid },
    process.env.SECRET_KEY,
    { expiresIn: "15m" }
  );
};



export const createRefreshToken=(sessionId)=>
{
    return jwt.sign({sessionId},process.env.SECRET_KEY,{expiresIn:"7d"});
}

export const verifyJWTToken=(token)=>
{
return jwt.verify(token,process.env.SECRET_KEY);
}

export const findSesssionById=async(sessionId)=>
{
    const res=await db.select().from(sessionsTable).where(eq(sessionsTable.id,sessionId));
    // console.log(res)
    return res[0];
    
}   

export const findUserById=async(userId)=>
{
    const res=await db.select().from(Users).where(eq(Users.id,userId));
    return res[0];  
}

export const refreshTokeni=async(refresh_token)=>
{
    try {
        const decoded=verifyJWTToken(refresh_token);
        // console.log("Decoded refresh token:", decoded);
        const currSession=await findSesssionById(decoded.sessionId);
        // console.log("Current session:", currSession);
        if(!currSession || !currSession.valid)
        {
            throw new Error("Invalid session");
        }
        const user=await findUserById(currSession.userId);
        if(!user) throw new Error("User not found");

        const userInfo={
            id:user.id,
            email:user.email,
            name:user.name,
            sessionId:currSession.id,
            isEmailValid: user.is_email_valid || user.isEmailValid || false,
        }
        const newAccessToken=createAccessToken(userInfo);
        const newRefreshToken=createRefreshToken(currSession.id);
// console.log("acess",newAccessToken);
// console.log("ref",newRefreshToken);
        return {
            accessToken:newAccessToken,
            refreshToken:newRefreshToken,
            user:userInfo,
        };
    } catch (error) {
        // console.log(error.message);
    }
}


export const redirectUserHomePage=async(req,res,data)=>
{

const sessionId=await createSession(data.id,{
        ip:req.ip,
        userAgent:req.headers["user-agent"],
    });
    // console.log("data",data);
    const accessToken =createAccessToken({
        id:data.id,
        email:data.email,
        name:data.name,
        sessionId,
        isEmailValid:data.is_email_valid,
    });

    const refreshToken = createRefreshToken(sessionId);

    const baseConfig={httpOnly:true,secure:true,sameSite: "lax"};

    res.cookie("access_token",accessToken,{
        ...baseConfig,
        maxAge:15*60*1000, //15 minutes
    });

    res.cookie("refresh_token",refreshToken,{
        ...baseConfig,
        maxAge:7*24*60*60*1000, //7 days
    });
    
    return res.redirect("/");

}



export const generateRandomToken=(digit=8)=>
{
    const min=10**(digit-1)
    const max=10**(digit);
    return crypto.randomInt(min,max).toString();
} 

export const insertVerifyEmailToken=async({userId,token})=>
{
await db
  .delete(VerifyEmailTokens)
  .where(lt(VerifyEmailTokens.expiresAt, new Date()));
  return await db.insert(VerifyEmailTokens).values({userId,token,expiresAt: new Date(Date.now() + TOKEN_EXPIRE_TIME),});
}

export const createVerifyEmailLink=async({email,token,userId})=>
{
    return `${process.env.FRONTEND_URL}/verify-email-token?token=${token}&email=${encodeURIComponent(email)}&userId=${userId}`;
}


export const sendVerificationEmailLink=async({userId,email})=>
{
    // console.log("Sending verification email to:", email, "for user ID:", userId);
    const randomToken=generateRandomToken();

    await insertVerifyEmailToken({
        userId,
        token:randomToken
    });

    const verifyEmailLink=await createVerifyEmailLink({
        email,
        token:randomToken,
        userId
    });
    const mjmlTemplate=await fs.readFile(
        path.join(import.meta.dirname,"..","emails","verify-email.mjml"),"utf-8"
    );
    
    const filledTemplate=ejs.render(mjmlTemplate,{code:randomToken,link:verifyEmailLink});

    // convert mjml to html
    const htmlOutput=mjml2html(filledTemplate).html;
    sendEmail({
        to:email,
        subject:"Verify your email",
        html:htmlOutput,
    }).catch(console.error);
}


export const refreshProfile=(req,res,newName)=>
{
    const newAccessToken = createAccessToken({
      id: req.user.id,
      email: req.user.email,
      name: newName || req.user.name,
      sessionId: req.user.sessionId,
      isEmailValid: true,
    });
    res.clearCookie("access_token");
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge:TOKEN_AGE,
    });
}


export const delPassTokens=async(userId)=>
{
    // console.log(userId);
    await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId,userId));
}
export const setPassword=async(userId,newPassword)=>
{
    const hashedPassword=await argon2.hash(newPassword);
    await db
    .update(Users)
    .set({password:hashedPassword})
    .where(eq(Users.id,userId));
}

export const createResetPasswordLink=async({userId})=>
{
   const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    await db
    .delete(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.userId, userId));

    await db.insert(passwordResetTokensTable).values({
        userId,
        tokenHash, 
    });

    return `${process.env.FRONTEND_URL}/reset-password/${token}`;
}

export const updateUserProfile=async({userId,name,avatarUrl})=>
{
    await db
    .update(Users)
    .set({name:name,avatarUrl:avatarUrl})
    .where(eq(Users.id,userId));
}

export const getResetPasswordToken=async(token)=>
{
    const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const [record] = await db
        .select()
        .from(passwordResetTokensTable)
        .where(
            and(
                eq(passwordResetTokensTable.tokenHash, tokenHash),
                gt(passwordResetTokensTable.expiresAt, new Date())
            )
        )
        .limit(1);
    return record;
}

export async function getUsersWithOauthId({ email, provider }) {
  const [user] = await db
    .select({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      isEmailValid: Users.Validemail, 
      providerAccountId: oauthAccountsTable.providerAccountId,
      provider: oauthAccountsTable.provider,
    })
    .from(Users)
    .leftJoin(
      oauthAccountsTable,
      and(
        eq(oauthAccountsTable.provider, provider),
        eq(oauthAccountsTable.UserId, Users.id)
      )
    )
    .where(eq(Users.email, email));

  return user;
}

export async function linkedUserWithOauth({ UserId, provider, providerAccountId }) {
  await db.insert(oauthAccountsTable).values({
    UserId,
    provider,
    providerAccountId,
  });
}

export async function createUserwithOauth({
  name,
  email,
  provider,
  providerAccountId,
}) {
    const safeName =
    name?.trim() ||
    email?.split("@")[0] ||
    "User";
  const user = await db.transaction(async (trx) => {
    const [user] = await trx
      .insert(Users)
      .values({
        email,
        name:safeName,
        Validemail: true, 
      })
      .$returningId();

    await trx.insert(oauthAccountsTable).values({
      provider,
      providerAccountId,
      UserId: user.id,
    });
    // console.log(name," || " , safeName)
    return {
      id: user.id,
      name:safeName,
      email,
      isEmailValid: true,
      provider,
      providerAccountId,
    };
  });

  return user;
}