import {getEmailModel} from "../mongo-models/abtest/emailModel";
import {sendEmail} from "../util/emailUtil";
import {waitListReady} from "../../content/email-templates/authEmails";
import {getAITaskModel} from "../mongo-models/tasks/openAITaskModel";
import axios from "axios";
import {getUserModel} from "../mongo-models/auth/userModel";
import {getTokenModel} from "../mongo-models/accounts/tokenModel";
import {WhiteModels} from "@failean/shared-types";
import subscription from "../resolvers/subscription";

const ONE_WEEK_IN_MS = 1000 * 60 * 60 * 24 * 7;
const TEN_MINUTES_IN_MS = 1000 * 60 * 10;
const HOUR_IN_MS = 1000 * 60 * 60;

const scheduleWaitingListReadyEmail = () => {
    setInterval(async () => {
        try {
            const emailDocs = await getEmailModel().find();
            for (const doc of emailDocs) {
                if (
                    !doc.emailSent &&
                    doc.product === "failean" &&
                    doc.email &&
                    new Date().getTime() - doc.createdAt.getTime() > ONE_WEEK_IN_MS
                ) {
                    const {subject, body} = waitListReady("Unknown");
                    const [res] = await sendEmail(doc.email, subject, body);
                    if (res.statusCode < 299 && res.statusCode >= 200) {
                        doc.emailSent = "yes";
                        await doc.save();
                    }
                }
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }, TEN_MINUTES_IN_MS * 2);
};

const cleanOldTasks = () => {
    setInterval(async () => {
        try {
            (await getAITaskModel().find()).forEach((task) => {
                if (
                    new Date().getTime() - task.startTime.getTime() >
                    TEN_MINUTES_IN_MS / 2
                ) {
                    task.status = "failed";
                    task.promptResIDOrReason = "timeout";
                    task.finishTime = new Date();
                    if (!task.promptName) task.promptName = "unknown";
                    task.save();
                }
            });
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }, TEN_MINUTES_IN_MS / 3);
};

const redirectLive = () => {
    setInterval(async () => {
        try {
            axios.get("https://app.failean.com/");
            axios.get("https://www.failean.com/");
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }, TEN_MINUTES_IN_MS / 2);
};


const giveSubscribers = () => {
    setInterval(async () => {
        try {
            /*   const tokenModel = getTokenModel();
               const users = await getUserModel().find();
               users.forEach(async ({_id, subscription}) => {
                   const tokenHistory = await tokenModel.find();
                   const sub = subscription;
                   if (subscription !== "free") {
                       tokenHistory.filter(({owner}) => owner === _id).find(({description}: WhiteModels.Accounts.WhiteToken) => (description === "subscribed to " + subscription))
                   }
               })*/

            //// using other method of refilling when charge made

        } catch (error) {
            console.error("An error occurred:", error);
        }
    }, HOUR_IN_MS * 3);
};


const scheduleAll = () => {
    scheduleWaitingListReadyEmail();
    cleanOldTasks();
    redirectLive();
    giveSubscribers();
};
export default scheduleAll;
