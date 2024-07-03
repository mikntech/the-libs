import { Router } from "express";
import conversationsRouter from "./conversationsRouter";
import messagesRouter from "./messagesRouter";
import { subscribeHandler } from "apps/server/src/controllers/chat";

const router = Router();

router.use("/conversations", conversationsRouter);
router.use("/messages", messagesRouter);

router.get("/subscribe", subscribeHandler);

export default router;
