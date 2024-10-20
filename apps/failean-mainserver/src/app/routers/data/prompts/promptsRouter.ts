import express from "express";
import {getPromptResultModel} from "../../../mongo-models/data/prompts/promptResultModel";
import {API, PromptName, PromptWireframe} from "@failean/shared-types";
import {addJobsToQueue} from "../../../jobs/openAIQueue";
import {convertMaptoDeckGraph, convertMaptoDepGraph} from "../../../util/data/prompts/promptUtil";
import aideatorPromptMap from "../../../../content/prompts/aideatorPromptMap";
import {authUser} from "../../../util/authUtil";
import {estimateOpenAI} from "../../../util/data/prompts/openAIUtil";
import {tokenCount} from "../../../util/accounts/tokensUtil";
import {getAITaskModel} from "../../../mongo-models/tasks/openAITaskModel";


import {axiosInstance} from "../../../../temp";

const router = express.Router();

router.get("/getPromptGraph", async (_, res) => {
    try {
        const graph: PromptWireframe[] = convertMaptoDepGraph(aideatorPromptMap);
        return res.status(200).json({
            graph,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({errorMessage: JSON.stringify(err)});
    }
});

router.get("/getDeckPromptGraph", async (_, res) => {
    try {
        const graph = convertMaptoDeckGraph();
        return res.status(200).json({
            graph,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({errorMessage: JSON.stringify(err)});
    }
});

router.post("/getPromptResult", async (req, res) => {
    try {
        const user = await authUser(req.cookies.jsonwebtoken);

        if (!user) {
            return res.status(401).json({clientMessage: "Unauthorized"});
        }

        const {ideaID, promptName}: { ideaID: string; promptName: PromptName } =
            req.body;

        const PromptResultModel = getPromptResultModel();

        if (promptName === "all") {
            const promptResults = await PromptResultModel.find({
                owner: user._id,
                ideaID,
            });

            return res.status(200).json({
                promptResult: promptResults,
            });
        }

        const promptResult = await PromptResultModel.find({
            owner: user._id,
            ideaID,
            promptName,
        });

        return res.status(200).json({
            promptResult: promptResult[promptResult.length - 1],
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({errorMessage: JSON.stringify(err)});
    }
});

router.post("/preRunPrompt", async (req, res) => {
    try {
        const user = await authUser(req.cookies.jsonwebtoken);

        if (!user) {
            return res.status(401).json({clientMessage: "Unauthorized"});
        }

        const {
            ideaID,
            promptNames,
            feedback,
        }: API.Data.RunAndGetPromptResult.Req = req.body;

        let avgx: number | undefined;

        try {
            if (axiosInstance) {
                const avg = (await axiosInstance.post("read/avgPriceForPrompt", {
                    promptName: promptNames,
                })).data.avg;
                console.log()
                if (avg !== "no") avgx = avg; else throw new Error("kakiii")
            }

        } catch (e) {
            console.log("estimated kaki - " + e);
            avgx = await Promise.all(
                promptNames.map((promptName) =>
                    estimateOpenAI(user, ideaID, promptName, feedback)
                )
            ).then((results) =>
                results.reduce(
                    (total, number) =>
                        (total !== null && total !== undefined ? total : 99999999) +
                        (number !== null && number !== undefined ? number : 99999999),
                    0
                )
            );
        }
        return res.status(200).json({price: avgx});
    } catch (error) {
        console.error(error);
        return res.status(500).json({clientMessage: "An error occurred"});
    }
});

router.post("/runAndGetPromptResult", async (req, res) => {
    try {
        const user = await authUser(req.cookies.jsonwebtoken);

        if (!user) {
            return res.status(401).json({clientMessage: "Unauthorized"});
        }

        if ((await tokenCount(user._id)) <= 0)
            return res
                .status(400)
                .json({clientMessage: "Token balance is not positive..."});

        const {
            ideaID,
            promptNames,
            feedback,
        }: API.Data.RunAndGetPromptResult.Req = req.body;

        await addJobsToQueue(user, ideaID, promptNames, feedback, req);

        return res.status(200).json({addedJobSequence: true});
    } catch (error) {
        console.error(error);
        return res.status(500).json({clientMessage: "An error occurred"});
    }
});

router.post("/savePromptResult", async (req, res) => {
    try {
        const user = await authUser(req.cookies.jsonwebtoken);

        if (!user) {
            return res.status(401).json({clientMessage: "Unauthorized"});
        }

        const {
            ideaID,
            promptName,
            data,
            reason,
        }: {
            ideaID: string;
            promptName: PromptName;
            data: string;
            reason: string;
        } = req.body;
        const PromptResultModel = getPromptResultModel();

        const savedPromptResult = new PromptResultModel({
            owner: user._id,
            ideaID,
            promptName,
            data,
            reason,
        });
        await savedPromptResult.save();
        return res.status(200).json({
            response: savedPromptResult.data,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({errorMessage: JSON.stringify(err)});
    }
});

router.get("/tasks", async (req, res) => {
    try {
        const user = await authUser(req.cookies.jsonwebtoken);
        if (!user) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        return res.status(200).json({data: (await getAITaskModel().find()).filter(({userID}) => userID === user._id.toString())});
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({message: 'An error occurred'});
    }
});

export default router;
