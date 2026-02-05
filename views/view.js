// import { R_DIR } from "../Routess/Routes.js";
// import {readFile} from "fs/promises";
import { loadLinks } from "../Model/model.js";
// import path from "path";

export const getInterface=(
     async (req, res) => {
        
        try {
            const isLoggedIn = req.isLoggedIn;
        
            if(isLoggedIn){
            const links = await loadLinks(req.user.id);
            res.render("index",{links, protocol: req.protocol,
            host: req.get("host"),isLoggedIn,errors: req.flash("errors"),
            success: req.flash("success")});
            }
           
            else
            {
                return res.redirect("/login");
            }
        } catch (error) {
            if(req.session===undefined)
            {
                return res.redirect("/login")
            }
            return res.status(500).send("Internal Server Error");
        }
    });