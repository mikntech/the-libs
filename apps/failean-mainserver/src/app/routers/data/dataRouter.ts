import express from "express";
import ideasRouter from "./ideas/ideasRouter";
import promptsRouter from "./prompts/promptsRouter";

const router = express.Router();

router.use("/ideas", ideasRouter);

router.use("/prompts", promptsRouter);

export default router;
