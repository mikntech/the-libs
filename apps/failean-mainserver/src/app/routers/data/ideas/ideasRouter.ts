import express from "express";
import {getIdeaModel} from "../../../mongo-models/data/ideas/ideaModel";
import jsonwebtoken from "jsonwebtoken";
import * as process from "process";
import {authUser} from "../../../util/authUtil";

const router = express.Router();

router.get("/getIdeas", async (req, res) => {
    try {
        const user = await authUser(req.cookies.jsonwebtoken);
        if (!user) return res.status(401).json({clientMessage: "Unauthorized"});
        const ideaModel = getIdeaModel();
        let hisIdeas = await ideaModel.find({
            owner: (user)._id,
            archived: false,
        });
        return res.status(200).json({
            ideas: hisIdeas
                .map((idea) => (idea as any)._doc)
                .sort(
                    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
                ),
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({errorMessage: JSON.stringify(err)});
    }
});

router.post("/saveIdea", async (req, res) => {
    try {
        const ideaModel = getIdeaModel();
        const user = await authUser(req.cookies.jsonwebtoken);

        if (!user) {
            return res.status(401).json({clientMessage: "Unauthorized"});
        }


        const {idea, ideaID} = req.body;
        try {
            const ideaToUpdate = await ideaModel.findById(ideaID);
            if (ideaToUpdate) {
                ideaToUpdate.idea = idea;
                await ideaToUpdate.save();
                return res.status(200).json({message: "Idea updated"});
            }
        } catch (err) {
        }
        await new ideaModel({
            owner: (user)._id,
            idea,
        }).save();
        return res.status(200).json({message: "Idea saved"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({errorMessage: JSON.stringify(err)});
    }
});

router.post("/archiveIdea", async (req, res) => {
    try {
        const ideaModel = getIdeaModel();

        const user = await authUser(req.cookies.jsonwebtoken);

        if (!user) {
            return res.status(401).json({clientMessage: "Unauthorized"});
        }


        const {ideaID} = req.body;
        const ideaToUpdate = await ideaModel.findById(ideaID);
        if (
            ideaToUpdate &&
            ideaToUpdate.owner.toString() === (user)._id.toString()
        ) {
            ideaToUpdate.archived = true;
            await ideaToUpdate.save();
            return res.status(200).json({message: "Idea updated"});
        } else
            return res
                .status(401)
                .json({errorMessage: "Unauthorized, not your idea"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({errorMessage: JSON.stringify(err)});
    }
});

export default router;
