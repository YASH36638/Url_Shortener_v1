import {MongoClient} from 'mongodb';

const client=new MongoClient("mongodb://localhost:27017")
await client.connect();
const db=client.db('mongodb_nodejs_db');

const userCollection=db.collection('users');


// write
// userCollection.insertOne({name:"Yashpal Jain",age:31});

// userCollection.insertMany([
//     {name:"Yashi Singh" ,age:32},
//     {name:"Singham",age:34}
// ]);


// read
// const users=userCollection.find();
// console.log(users);

// for await (const user of users)
// {
//     console.log(user);
// }

// const user=await userCollection.findOne({name:"Singh"});
// console.log(user)

// update

// await userCollection.updateOne({name:"Singh"},{$set:{age:30}})

await userCollection.updateMany({name:"Yashika Jain"},{$set:{age:30}})

// await userCollection.deleteMany({age:32});