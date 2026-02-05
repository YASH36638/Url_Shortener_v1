import {Resend} from "resend";

const resend=new Resend(process.env.RESEND_API_KEY);

export const sendEmail=async({to,subject,html})=>
{
    try {
        await resend.emails.send({
        from:"Website <website@resend.dev>",
        to:[to],
        subject,
        html
    });
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}