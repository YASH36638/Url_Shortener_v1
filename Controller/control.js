import { saveLinks,doExists } from "../Model/model.js";
import crypto from 'crypto';
import { urlValidator } from "../Validator/auth.validation.js";
// import { shortenerSchema } from "../Validator/shortner.validator.js";


export const postShortend=async (req, res) => {
    // const links = await loadLinks();
    
    if(!req.isLoggedIn) return res.redirect("/login");
    const id=req.user.id;
    const result=urlValidator.safeParse(req.body.user);
    if (!result.success) {
        const message = result.error.issues[0].message;
        req.flash("errors", message);
        return res.redirect("/");
    }
    let { url, code } = req.body.user;


    if (!code || code.trim() === "") {
        code = crypto.randomBytes(4).toString('hex');
    }
    if (!url) {
        return res.status(400).send("URL is required.");
    }
    if (await doExists(code,id)) {
        req.flash(
            "errors","Url with this shortcode exists,please choose another");
        return res.redirect("/");
    }

    // links[code] = url;
    
    await saveLinks({url,code,id});
    res.redirect("/");
}


// export const deleteShortCode=(req,res)=>
// {
// try {
//     const id=req.user.id;
// } catch (error) {
    
// }
// }