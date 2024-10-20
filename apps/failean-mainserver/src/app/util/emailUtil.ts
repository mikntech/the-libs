import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import name from "../../content/name";
import * as process from "process";

dotenv.config();

export const sendEmail = async (to: string, subject: string, html: string) => {
    sgMail.setApiKey(process.env.SENDGRID + "");

    return await sgMail.send({
        from: {
            email: "service@failean.com",
            name: name.up,
        },
        to,
        subject,
        html,
    });
};
