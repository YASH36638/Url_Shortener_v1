import { getUrlbyId ,updateDb,deleteCode} from "../Model/model.js";
import { getUserByEmail,addToDb, validUser } from "../services/auth.services.js";
// import { validUser } from "../services/auth.services.js";
// import { generateToken } from "../services/auth.services.js";
import { registerUserSchema } from "../Validator/auth.validation.js";
import { shortenerSchema } from "../Validator/shortner.validator.js";
import { createSession,createAccessToken, createRefreshToken  } from "../services/auth.services.js";

export const getRegisterPage=(req,res)=>
{
    res.render("auth/register",{errors:req.flash("errors")});
}

export const getLoginPage=(req,res)=>
{
    res.render("auth/login",{errors:req.flash("errors")});
}

export const postLogin=async(req,res)=>
{
    if(req.user) return res.redirect("/");
    // res.setHeader("Set-Cookie","isLoggedIn=true; path=/;")
    const {email,password}=req.body;
    const result=await validUser({email,password});
    // console.log("result",result)
    // console.log("res",result)
    console.log("1");
    if (!result.ok) {
        // console.log("Invalid credentials");
        req.flash("errors",result.reason);
        return res.redirect("/login");
        
    }
    
    // req.session.userId = result.user.id;

    // res.cookie("isLoggedIn",true);
    // res.redirect("/");

    //used this previously for sole jwt based auth
    // const token=generateToken({
    //     id:result.user.id,
    //     email:result.user.email,
    //     name:result.user.name,
    // });


    // // console.log("token",token);
    // res.cookie("access_token",token);


    const session=await createSession(result.user.id,{
        ip:req.clientIp,
        userAgent:req.headers["user-agent"],
    });

    const accessToken =createAccessToken({
        id:result.user.id,
        email:result.user.email,
        name:result.user.name,
        sessionId:session.id,
    });

    const refreshToken = createRefreshToken(session.id);

    const baseConfig={httpOnly:true,secure:true,sameSite: "lax"};

    res.cookie("access_token",accessToken,{
        ...baseConfig,
        maxAge:15*60*1000, //15 minutes
    });

    res.cookie("refresh_token",refreshToken,{
        ...baseConfig,
        maxAge:7*24*60*60*1000, //7 days
    });
    // console.log("3");
    req.flash("success", result.reason);
    return res.redirect("/");
}

export const postRegister=async(req,res)=>
{
    if(req.user) 
        { 
            req.flash("errors","User with email Exists")
            return res.redirect("/");
        }
    // console.log(req.body)
    // const {name,email,password}=req.body;

    const result = registerUserSchema.safeParse(req.body);

    if (!result.success) {
        const message = result.error.issues[0].message;
        req.flash("errors", message);
        return res.redirect("/register");
    }

const data = result.data;
    const {name,email,password}=data;
    const exists=await getUserByEmail(email);
    // console.log("exits",exists);
    if(exists.length>0) 
        { 
            req.flash("errors","User with email Exists")
            return res.redirect("/register");
        }
    const regUser=await addToDb({name,email,password});
    // console.log("regUser",regUser);
    res.redirect("/login");
}

export const getProfile=(req,res)=>
{
   if(!req.user) return res.send("Not loggged in.");
   return res.render("profile");

}

export const logoutUser = (req, res) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.redirect("/");
}


export const getEditPage=async(req,res)=>
{
    // console.log("req.body =:= )->",req.params.id);
    // console.log("req.user.id",req.user.id);
    const links= await getUrlbyId(req.user.id,req.params.id)
    // console.log(links)
    return res.render("edit",{link:links,id:req.params.id,errors:null});
}

export const postEdit=async(req,res)=>
{
//     console.log({
//     body: req.body,
//     url: req.body?.url,
//     shortCode: req.body?.shortCode,
//     paramId: req.params.id,
//     userId: req.user?.id,
// });
// console.log("req.body",req.body);
    const result=shortenerSchema.safeParse(req.body);
    // console.log("result",result);
    if(!result.success) 
    {
        const message = result.error.issues[0].message;
        req.flash("errors", message);
        // console.log("me",message)
        // return res.render("edit",{errors:message,id:req.params.id,url:req.body.url,shortCode:req.body.shortCode});  
        // return res.render(`/edit/${req.params.id}`,{errors:message});

        // return res.redirect(`/edit/${req.params.id}`);
        return res.render("edit", {
        errors: message,
        id: req.params.id,
        link: {
            url: req.body.url,
            shortCode: req.body.shortCode
        }
    });
    }

    const updt=await updateDb(req.body.url,req.body.shortCode,req.params.id,req.user.id); 
    // console.log("req.body of post" , req.body)
    return res.redirect("/");
}


export const deleteShortCode=async(req,res)=>
{
    try {  
        const id=req.user.id;
        const linkId=req.params.id;
        await deleteCode(linkId,id);
        // console.log("Deleting linkId:", linkId, "for userId:", id);
        return res.redirect("/");
     }
    catch (error) {
        // console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}