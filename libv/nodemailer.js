import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.

const account = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "elinore.hartmann@ethereal.email",
    pass: "TquGb482jFxRJEKH4R",
  },
});

// Send an email using async/await
export const sendEmail=async({to,subject,html})=>{
    const info = await transporter.sendMail({
        to,subject,html,
        from: `"Url Shortener" <${account.user}>`});
       const testUrl = nodemailer.getTestMessageUrl(info);
       console.log("Test URL:", testUrl);
}

