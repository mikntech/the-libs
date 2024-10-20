import express from "express";
import jsonwebtoken from "jsonwebtoken";

const router = express.Router();

router.get("/data/critiqQuestionire/:ideaID", async (req, res) => {
    try {
        const token = req.cookies.jsonwebtoken;
        if (!token) return res.status(401).json({errorMessage: "Unauthorized."});
        const validatedUser = jsonwebtoken.verify(
            token,
            process.env.JWT + ""
        );
        /*
              let ideacritiqQuestionire = await answerModel.find({
                  ideaID: req.params.ideaID,
                  owner: (validatedUser  ).id,
              });

              return res
                .status(200)
                .json(ideacritiqQuestionire.map((answer: CritiqDocument) => answer._doc)); */
    } catch (err) {
        console.log(err);
        return res.status(500).json({errorMessage: JSON.stringify(err)});
    }
});

router.post("/data/critiqQuestionire/update", async (req, res) => {
    try {
        const token = req.cookies.jsonwebtoken;
        if (!token) return res.status(401).json({errorMessage: "Unauthorized."});
        const validatedUser = jsonwebtoken.verify(
            token,
            process.env.JWT + ""
        );
        const {ideaID, questionId, answer, score} = req.body;
        /*

                const answerToUpdate = await answerModel.findOne({
                    ideaID,
                    questionId,
                    owner: (validatedUser  ).id,
                });

                if (!answerToUpdate) {
                    // Create a new answer if not exist
                    await new answerModel({
                        ideaID,
                        questionId,
                        answer,
                        score,
                        owner: (validatedUser  ).id,
                    }).save();
                } else {
                    /!*  answerToUpdate.answer = answer;
                    answerToUpdate.score = score; *!/
                    await answerToUpdate.save();
                }
        */

        return res.status(200).json({message: "Answer updated"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({errorMessage: JSON.stringify(err)});
    }
});

export default router;
