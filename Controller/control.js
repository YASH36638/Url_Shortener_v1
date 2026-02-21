import { saveLinks,doExists } from "../Model/model.js";
import crypto from 'crypto';
import { urlValidator } from "../Validator/auth.validation.js";


export const postShortend=async (req, res) => {
    
    if(!req.isLoggedIn) return res.redirect("/login");
    const id=req.user.id;
    const result=urlValidator.safeParse(req.body.user);
    if (!result.success) {
        const message = result.error.issues[0].message;
        req.flash("errors", message);
        return res.redirect("/");
    }
    let { url, code } = req.body.user;
    let safeCode=code.trim();
    safeCode += crypto.randomBytes(4).toString('hex');
    
    if (!url) {
        return res.status(400).send("URL is required.");
    }
    if (await doExists(safeCode,id)) {
        req.flash(
            "errors","Url with this shortcode exists,please choose another");
        return res.redirect("/");
    }

    // links[code] = url;
    // console.log(code);
    
    // console.log(safeCode);
    await saveLinks({url,safeCode,id});
    res.redirect("/");
}


