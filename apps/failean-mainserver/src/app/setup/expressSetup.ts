import express, {Request, Response, NextFunction} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import expressBasicAuth from "express-basic-auth";
import {serverAdapter} from "../jobs/openAIQueue";
import {clientDomain, ocClientDomain} from "./config";
import routers from "../routers";
import pack from "../../../package.json";
import * as process from "process";
import {getEmailModel} from "../mongo-models/abtest/emailModel";

export const app = express();
export const port = 6555;


const {
    authRouter,
    accountsRouter,
    websiteRouter,
    dataRouter,
    gqlRouter,
    analyticsRouter,
    stripeRouter,
    abtestRouter
} = routers;
const axiosLogger = (req: Request, res: Response, next: NextFunction) => {
    next();
};

const middlewares = [
    cookieParser(),
    express.json({limit: "50mb"}),
    express.urlencoded({limit: "50mb", extended: true}),
    cors({
        origin: [ocClientDomain, clientDomain, "https://failean.com", "https://scailean.com"],
        credentials: true,
    }),
    axiosLogger,
];

middlewares.forEach((middleware) => app.use(middleware));

app.use("/accounts", accountsRouter);
app.use("/auth", authRouter);
app.use("/website", websiteRouter);
app.use("/analytics", process.env.NODE_ENV === "production" && process.env.WHITE_ENV === "prod" ? analyticsRouter : (_, res) => res.status(200).send());
app.use("/data", dataRouter);
app.use("/gql", gqlRouter);
app.use("/stripe", stripeRouter);
app.use("/abtest", abtestRouter);
app.get("/abtestg", async (_, res) => {
    try {
        const reses = await (getEmailModel()).find();
        const a = reses.filter(({product}) => product === "failean").length;
        const b = reses.filter(({product}) => product === "scailean").length;
        return res.status(200).json({
            a,
            b, c: reses.length - a - b
        })
    } catch (e) {
        return res.status(500).json({err: e})
    }
});

const {version} = pack;

app.get("/areyoualive", (_, res) => {
    res.json({answer: "yes", version});
});

if (process.env.NODE_ENV === "production") {
    app.use(
        "/admin/queues",
        expressBasicAuth({
            users: {
                [`${process.env.ADMIN_USER}`]: `${process.env.ADMIN_PASSWORD}`,
            },
            challenge: true,
            realm: "Imb4T3st4pp",
        }),
        serverAdapter.getRouter()
    );
} else {
    app.use("/admin/queues", serverAdapter.getRouter());
}

