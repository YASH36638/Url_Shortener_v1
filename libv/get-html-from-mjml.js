import fs from "fs/promises";
import ejs from "ejs";
import mjml2html from "mjml";
import Path from "path";

export const getHtmlFromMjmlTempplate=async(templateName,data)=>{
const mjmlTemplate=await fs.readFile(Path.join(import.meta.dirname,"..","emails",`${templateName}.mjml`),"utf-8");


const filledTemplate=ejs.render(mjmlTemplate,data);

const htmlOutput=mjml2html(filledTemplate).html;
return htmlOutput;
}