// import { R_DIR } from "../Routess/Routes.js";
// import {readFile} from "fs/promises";
import { loadLinks } from "../Model/model.js";
// import path from "path";

export const getInterface=(
     async (req, res) => {
        
        // const ROOT_DIR=R_DIR;
        try {
            
            // isLoggedIn=Boolean(isLoggedIn?.split(";")?.find((cookie)=>cookie.trim().startsWith("isLoggedIn"))?.split("=")[1]);
            
            
            const isLoggedIn = req.isLoggedIn;
            // console.log("isLoggedIn value:", isLoggedIn);
            // console.log("req.isLoggedIn",req);
            // console.log("isLoggedIn",isLoggedIn)
            // console.log("entered getInterface");
            // let isLoggedIn=true;
            // let file = await readFile(path.join(ROOT_DIR, "views", "index.html"), 'utf-8');
            if(isLoggedIn){
                // console.log("req.user.id",req.user.id);
            const links = await loadLinks(req.user.id);
            // console.log("url" ,links.url);
            res.render("index",{links, protocol: req.protocol,
            host: req.get("host"),isLoggedIn,errors: req.flash("errors"),
            success: req.flash("success")});
            }
            // const listItems = Object.entries(links)
            //     .map(([code, url]) =>
            //         `<li><a href="/${code}" target="_blank">${req.protocol}://${req.get("host")}/${code}</a> → ${url}</li>`)
            //     .join('');
            
            // const content = file.toString().replaceAll(/\{\{ \}\}/g, listItems);
            // res.send(content);
            else
            {
                // console.log("User not logged in, redirecting to login page");
                return res.redirect("/login");
            }
        } catch (error) {
            // console.log(error)
            if(req.session===undefined)
            {
                return res.redirect("/login")
            }
            return res.status(500).send("Internal Server Error");
        }
    });