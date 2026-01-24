import express from 'express';
import cookieParser from "cookie-parser";
import session from 'express-session';
import requestIP from 'request-ip';
import flash from 'connect-flash';

import { verifyJWT } from './Middleware/auth.middleware.js';
import {Shortened} from './Routess/Routes.js'
import { authRoutes } from './Routess/auth.routes.js';

const PORT = 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));


app.set("view engine","ejs");
app.use(cookieParser());
app.use(session({secret:process.env.secret,resave:true,saveUninitialized:false}));
app.use(flash())
app.use(requestIP.mw());
app.use(verifyJWT);
app.use((req,res,next)=>
{
    res.locals.user=req.user;
    return next();
});
app.use(authRoutes);
app.use(Shortened);

app.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
});