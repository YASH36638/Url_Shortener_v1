import { sessionsTable, Users } from "../DrizzleORM/drizzle/schema.js";
import {db} from "../DrizzleORM/config/db.js"
import { eq } from "drizzle-orm";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import dotenv from "dotenv";
dotenv.config();

export const getUserByEmail=async(email)=>
{
const res=await db.select().from(Users).where(eq(Users.email,email));
// console.log(res);
return res;
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
            email: user.email
        }
    }  //here we can return entire user too instead of being specific.
};  


export const generateToken=({id,email,name})=>
{
    // console.log(process.env.SECRET_KEY);
    return jwt.sign({id,email,name},process.env.SECRET_KEY,{expiresIn:"1h"});
}


export const createSession=async(userId,{ip,userAgent})=>
{
    const session=await db.insert(sessionsTable).values({userId,ip,userAgent}).execute();
    console.log("Created session with ID:", session);
    return {id:session.insertId};

}

export const createAccessToken=({id,email,name,sessionId})=>
{
    return jwt.sign({id,email,name,sessionId},process.env.SECRET_KEY,{expiresIn:"15m"});
}

export const createRefreshToken=(sessionId)=>
{
    return jwt.sign({sessionId},process.env.SECRET_KEY,{expiresIn:"7d"});
}