import { Router } from "express";
import conversationsRouter from "./conversationsRouter";
import messagesRouter from "./messagesRouter";
import { subscribeHandler } from "../../controllers/chat";
import { TODO } from "base-backend";

export const chatRouter = Router();

chatRouter.use("/conversations", conversationsRouter);
chatRouter.use("/messages", messagesRouter);

chatRouter.get("/subscribe", subscribeHandler(null) as TODO);
