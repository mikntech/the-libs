import sendgrid from "@sendgrid/mail";
import { getBaseSettings } from "base-backend";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    sendgrid.setApiKey(getBaseSettings().sendgridApiKey);
    await sendgrid.send({
      to,
      from: getBaseSettings().sendgridSender,
      subject,
      html,
    });
    getBaseSettings().stagingEnv === "local" &&
      console.log("Successfully sent email to " + to);
  } catch (error) {
    getBaseSettings().stagingEnv !== "local" &&
      console.log("Error sending email:", error);
  }
};
