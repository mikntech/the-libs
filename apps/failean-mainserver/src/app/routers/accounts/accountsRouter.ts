import express from "express";
import jsonwebtoken from "jsonwebtoken";
import {API} from "@failean/shared-types";
import {tokenCount} from "../../util/accounts/tokensUtil";
import * as process from "process";
import {authUser} from "../../util/authUtil";

const router = express.Router();

router.get<never, API.Accounts.CountTokens.Res>(
    "/countTokens",
    async (req, res) => {
        try {
            const user = await authUser(req.cookies.jsonwebtoken);

            if (!user) {
                return res.status(401).json({errorMessage: "Unauthorized"});
            }

            return res.status(200).json({tokens: await tokenCount(user._id)});
        } catch (err) {
            console.error(err);
            return res.status(500).json({errorMessage: "Server error logged"});
        }
    }
);

export default router;
