import pubsub, {openAIQueue} from "../setup/redisSetup";
import {getIdeaModel} from "../mongo-models/data/ideas/ideaModel";
import aideatorPromptMap from "../../content/prompts/aideatorPromptMap";
import {API, OCModels, PromptName, PromptPart, WhiteModels,} from "@failean/shared-types";
import {getPromptResultModel} from "../mongo-models/data/prompts/promptResultModel";
import {callOpenAI} from "../util/data/prompts/openAIUtil";
import {createBullBoard} from "@bull-board/api";
import {BullAdapter} from "@bull-board/api/bullAdapter";
import {ExpressAdapter} from "@bull-board/express";
import stringSimilarity from "../util/string-similarity";
import {INVALID_PROMPT_MESSAGE} from "../util/messages";
import {safeStringify} from "../util/jsonUtil";
import {getAITaskModel} from "../mongo-models/tasks/openAITaskModel";
import {getUserModel} from "../mongo-models/auth/userModel";
import {axiosInstance} from "../../temp";
import ExpressRequest = OCModels.ExpressRequest;


export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
createBullBoard({
    queues: [new BullAdapter(openAIQueue)],
    serverAdapter: serverAdapter,
});

openAIQueue.process(async (job) => {
    const PromptResultModel = getPromptResultModel();
    const ideaModel = getIdeaModel();
    try {
        const {taskID, ideaID, promptName, feedback, reqUUID} = job.data;
        const user = await (getUserModel()).findById(((await getAITaskModel().findById(taskID))?.userID));
        const idea = await ideaModel.findById(ideaID);
        let dependencies;
        const prompt = aideatorPromptMap[promptName];
        if (prompt) {
            let promises = prompt.prompt.map(async (promptPart: PromptPart) => {
                if (promptPart.type === "variable" && promptPart.content !== "idea") {
                    let promptRes = await PromptResultModel.find({
                        owner: user?._id,
                        ideaID,
                        promptName: promptPart.content,
                    });
                    return {
                        x: promptRes[promptRes.length - 1]?.data,
                    };
                }
            });


            await Promise.all(promises).then(async (updatedPropmtResult) => {
                dependencies = updatedPropmtResult.map((r) => {
                    return r;
                });

                const cleanDeps: { x: string }[] = [];
                dependencies.forEach((dep) => {
                    if (dep?.x && dep.x !== INVALID_PROMPT_MESSAGE) cleanDeps.push(dep);
                });
                let i = 0;

                let missing = false;

                const constructedPrompt = prompt.prompt.map(
                    (promptPart: PromptPart) => {
                        if (promptPart.type === "static") return promptPart.content;
                        else if (promptPart.type === "variable") {
                            if (promptPart.content === "idea") return idea?.idea;
                            i++;
                            const res = (cleanDeps[i - 1])?.x;
                            console.log(promptPart.content + ": ", (!(res?.length > 1)) ? "is missing!" : "is ok so false")
                            missing = missing || !(res?.length > 1);
                            return res;
                        }
                    }
                );

                if (missing) throw new Error("Missing dependencies");
                console.log("goooodddddd3")

                const promptResult =
                    feedback?.length &&
                    feedback?.length > 1 &&
                    (await PromptResultModel.find({
                        owner: user?._id,
                        ideaID,
                        promptName,
                    }));


                const chat = promptResult && [promptResult.length - 1] &&
                promptResult[promptResult.length - 1]?.data
                    ? [
                        {role: "user", content: constructedPrompt.join("")},
                        {
                            role: "assistant",
                            content: promptResult[promptResult.length - 1].data,
                        },
                        {role: "user", content: feedback},
                    ]
                    : [{role: "user", content: constructedPrompt.join("")}]


                if (!chat) throw new Error("asd")

                const res = await callOpenAI(
                    user as unknown as WhiteModels.Auth.WhiteUser,
                    prompt.role,
                    chat as any,
                    promptName,
                    reqUUID
                );


                if (res === -1) throw new Error("Acoount error");
                else if (res === -2) throw new Error("No Tokens");
                else {
                    const {completion, price} = res

                    console.log("goooodddddd2")


                    const savedResult = new PromptResultModel({
                        owner: user?._id,
                        ideaID,
                        promptName,
                        data: (completion).choices[0].message?.content,
                        reason:
                            feedback?.length && feedback?.length > 1 ? "feedback" : "run",
                    });
                    await savedResult.save();
                    const similarToInvalidGood = stringSimilarity(
                        (completion).choices[0].message?.content + "",
                        INVALID_PROMPT_MESSAGE
                    )

                    const similarToInvalidBad = stringSimilarity(completion.choices[0].message?.content + "", "Invalid Idea.")
                    const similarToInvalidBad2 = stringSimilarity(completion.choices[0].message?.content + "", "Invalid input.")

                    if (
                        similarToInvalidGood > 0.4 || similarToInvalidBad > 0.4 || similarToInvalidBad2 > 0.4
                    ) {
                        axiosInstance?.post("log/logInvalidPrompt", {
                            stringifiedCompletion: safeStringify(completion),
                            prompt: constructedPrompt.join(""),
                            result: (completion).choices[0].message?.content,
                            promptName,
                            ideaID,
                            openAICallReqUUID: reqUUID || "unknown"
                        })
                            .catch((err) => console.error(err));
                        console.log("result was: ", similarToInvalidGood, similarToInvalidBad, similarToInvalidBad2)
                        throw new Error("invalid");
                        console.log("goooodddddd")

                    } else {
                        const task = await getAITaskModel().findById(taskID);
                        if (task) {
                            task.status = "successful"
                            task.promptResIDOrReason = price ? price + "" : "unknown"
                            task.finishTime = new Date();
                        }
                        await task?.save()
                        pubsub.publish("JOB_COMPLETED", {
                            jobCompleted: (job?.id || "8765") + "",
                        });
                        console.log("Published update for job ", {
                            jobCompleted: (job?.id || "8765") + "",
                        });
                    }

                }
            });
        }


    } catch (error) {
        console.error(`An error occurred during job processing: ${error}`);
        pubsub.publish("JOB_COMPLETED", {
            jobCompleted: (job?.id || "8765") + "",
            status: "error",
            message: error,
        });
        const task
            = await getAITaskModel().findById(job.data.taskID);
        if (task) {
            task.status = "failed"
            task.promptResIDOrReason = error;
            task.finishTime = new Date();
        }
        await task?.save()
    }
});
openAIQueue.on("error", (error) => {
    console.error(`A queue error happened: ${error}`);
});

openAIQueue.on("completed", () => {

})

export const addJobsToQueue = async (
    user: WhiteModels.Auth.WhiteUser,
    ideaID: string,
    promptNames: PromptName[],
    feedback: API.Data.RunAndGetPromptResult.Req["feedback"],
    req: any
) => {

    const addJobToQueue = async (
        user: WhiteModels.Auth.WhiteUser,
        ideaID: string,
        promptName: PromptName,
        feedback: API.Data.RunAndGetPromptResult.Req["feedback"],
        req: ExpressRequest
    ) => {
        const {_id: taskID} = await (new (getAITaskModel())({
            startTime: new Date()
            , status: "running", userID: user._id, promptName
        })).save();
        await openAIQueue
            .add({taskID, ideaID, promptName, feedback, reqUUID: req.uuid})
            .then((job) => {
                job.finished().then(async () => {
                    promptNames.shift();
                    if (promptNames[0] === "idea") promptNames.shift();
                    if (promptNames.length > 0) {
                        addJobToQueue(user, ideaID, promptNames[0], feedback, req);
                    }

                });
            });
    };

    if (promptNames.length > 0) {
        await addJobToQueue(user, ideaID, promptNames[0], feedback, req);
    }
};

export default openAIQueue;
