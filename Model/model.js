// import { writeFile,readFile } from 'fs/promises';
// import path from 'path';
// import { R_DIR } from '../Routess/Routes.js';

// import { dbclient } from "../config/db-client.js"
import { eq ,and} from "drizzle-orm";
import { shortLinksTable } from "../DrizzleORM/drizzle/schema.js";
import {db} from "../DrizzleORM/config/db.js"
// export const loadLinks = async () => {
//     try {
//         const data = await readFile(path.join(R_DIR, 'data', 'links.json'), 'utf-8');
//         return JSON.parse(data);
//     }
//     catch (err) {
//         if (err.code === 'ENOENT') {
//             console.log("File not found, creating new one.");
//             await writeFile(path.join(R_DIR, 'data', 'links.json'),"{}",'utf-8'); 
//             return {};
//         }
//         throw err;
//     }
// }

// export const saveLinks = async (links) => {
//     await writeFile(path.join(R_DIR, 'data', 'links.json'), JSON.stringify(links, null, 2));
// }
// const db=dbclient.db(env.MONGODB_DATABASE_NAME);
// const collect=db.collection('links')

export const loadLinks=async(id)=>
{
    // console.log("req.user loadlinks ",id);
    return await db.select().from(shortLinksTable).where(eq(shortLinksTable.userId,id))
    // return collect.find().toArray();
};

export const saveLinks=async(link)=>
{
    // console.log("req.user.id savelinks" , link.userId);
    // return collect.insertOne(link);
     const res=await db.insert(shortLinksTable).values({url:link.url,shortCode:link.code,userId:link.id});
     return res;
}

export const getUrlByShortcode=async(code,id)=>
{
    // return collect.findOne({code:code});
    const res=await db.select().from(shortLinksTable).where(and(eq(shortLinksTable.shortCode, code),eq(shortLinksTable.userId,id)));
    // console.log(res);
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
  )
        .limit(1);
    return res.length>0;    
}

export const deleteCode=async(linkId,id)=>
{
return await db.delete(shortLinksTable).where(and(eq(shortLinksTable.id, parseInt(linkId)),eq(shortLinksTable.userId,id)));
}

export const getUrlbyId=async(userId,linkId)=>
{
    try {
            const links=await db.select().from(shortLinksTable).where(and(eq(shortLinksTable.userId,userId),eq(shortLinksTable.id,parseInt(linkId))))
        // console.log(links)
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