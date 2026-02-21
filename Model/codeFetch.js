// import { loadLinks } from "./model.js";
import { getUrlByShortcode } from "./model.js";

export const redirectLinks= async (req, res) => {
    // const links = await loadLinks();
  
  if (req.params.code === "favicon.ico") {
    return res.status(204).end();
  }
    const { code } = req.params;
    const link=await getUrlByShortcode(code)
    // console.log(link)
    
    // if (link) {
    //     console.log(link.url)
    //     return res.redirect(link.url);
    // }
    
    if (!link) {
    // return res.redirect("/");
    return res.status(404).send("Shortened URL not found.");
  }

  return res.redirect(link.url);
}