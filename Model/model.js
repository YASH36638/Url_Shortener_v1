import { eq ,and, sql} from "drizzle-orm";
import { shortLinksTable,Users, VerifyEmailTokens } from "../DrizzleORM/drizzle/schema.js";

import {db} from "../DrizzleORM/config/db.js"

export const loadLinks=async(id)=>
{
    return await db.select().from(shortLinksTable).where(eq(shortLinksTable.userId,id))
};

export const saveLinks=async(link)=>
{

     const res=await db.insert(shortLinksTable).values({url:link.url,shortCode:link.safeCode,userId:link.id});
     return res;
}

export const getUrlByShortcode=async(code,id)=>
{
  
    const res=await db.select().from(shortLinksTable).where(and(eq(shortLinksTable.shortCode, code),eq(shortLinksTable.userId,id)));

    return res[0]??null;
}

export const doExists=async(Code,userId)=>
{
    const res = await db
        .select({ id: shortLinksTable.id })
        .from(shortLinksTable)
        .where(
        and(
      eq(shortLinksTable.shortCode, Code),
      eq(shortLinksTable.userId, userId)
    )
  ).limit(1);
    return res.length>0;    
}

export const deleteCode=async(linkId,id)=>
{
return await db.delete(shortLinksTable)
.where(and(
    eq(shortLinksTable.id, parseInt(linkId)),
    eq(shortLinksTable.userId,id)
    ));
}

export const getUrlbyId=async(userId,linkId)=>
{
    try {
        const links=await db.select().from(shortLinksTable)
        .where(and(
        eq(shortLinksTable.userId,userId),
        eq(shortLinksTable.id,parseInt(linkId))
        )); 
        return links;
    } catch (error) {
        console.log(error);
        return null;
    }
    
}

export const updateDb=async(url,shortCode,id,userId)=>
{
return await db
        .update(shortLinksTable)
        .set({
            url,
            shortCode,
            updatedAt: new Date()
        })
        .where(
            and(
                eq(shortLinksTable.id, parseInt(id)),
                eq(shortLinksTable.userId, userId)
            )
        );
}

export const getLinkCounts=async(userId)=>
{
    let result=await db.select({ count: sql`count(*)` }).from(shortLinksTable).where(eq(shortLinksTable.userId,userId));
    let date=await db.select({date:sql`DATE(created_at)`}).from(Users).where(eq(Users.id,userId));
    result=Number(result[0].count);
    date=date[0].date;

    return {count:result,createdAt:date};
}

export const setEmailValid=async(email)=>
{
    return await db
    .update(Users)
    .set({ Validemail: true })
    .where(eq(Users.email, email));
}

export const delTokens=async(token)=>
{
    await db
        .delete(VerifyEmailTokens)
        .where(eq(VerifyEmailTokens.token, token));
}
export const getVerifyTokenRecord=async(token,userId)=>
{

    return await db
      .select()
      .from(VerifyEmailTokens)
      .where(and(eq(VerifyEmailTokens.token, token),eq(VerifyEmailTokens.userId, Number(userId))))
      .limit(1);
}