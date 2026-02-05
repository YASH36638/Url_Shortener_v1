import {db} from "./config/db.js";

import {usersTable} from "./drizzle/schema.js";

const main=async()=>
{
    // write
// const insertUser=await db.insert(usersTable).values({name:"Yash",age:21,email:"Email@yash.com"});
// const insertUser=await db.insert(usersTable).values([{name:"Yash",age:21,email:"Emil@yash.com"},{name:"Yash",age:21,email:"Eail@yash.com"}]);

// console.log(insertUser);

// Create
const userTable=await db.select().from(usersTable);
// console.log(userTable)

}
main().catch((error)=>
{
    console.log(error);
})