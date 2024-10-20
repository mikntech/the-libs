import express from "express";
import bodyParser from "body-parser";
import {getEmailModel} from "../../mongo-models/abtest/emailModel";

const router = express.Router();

router.use(bodyParser.urlencoded({extended: true}));


router.post('/failean', async (req, res) => {
    try {
        const email = req.body.email;
        if (!email) {
            return res.status(400).send('Missing email');
        }
        const emailModel = getEmailModel();
        const doc = new emailModel({email, product: "failean"});
        await doc.save();
        return res.status(200).redirect("https://failean.com/suc");
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/scailean', async (req, res) => {
    try {
        const email = req.body.email;
        if (!email) {
            return res.status(400).send('Missing email');
        }
        const emailModel = getEmailModel();
        const doc = new emailModel({email, product: "scailean"});
        await doc.save();
        return res.status(200).redirect("https://scailean.com/suc");
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
