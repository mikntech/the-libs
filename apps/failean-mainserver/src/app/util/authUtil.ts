import jsonwebtoken, {JwtPayload} from "jsonwebtoken";
import {getUserModel} from "../mongo-models/auth/userModel";
import {WhiteModels} from "@failean/shared-types";
import * as process from "process";

type WhiteUser = WhiteModels.Auth.WhiteUser;

export const authUser = async (token: string): Promise<WhiteUser | null> => {
    const userModel = getUserModel();
    try {
        if (!token) return null;
        const validatedUser = jsonwebtoken.verify(
            token as string,
            process.env.JWT + ""
        );
        return userModel.findById((validatedUser as JwtPayload).id) || null;
    } catch (err) {
        return null;
    }
};
