import express from "express";
import {getUserModel} from "../../mongo-models/auth/userModel";
import {amendTokens} from "../../util/accounts/tokensUtil";

const router = express.Router();


router.post("/paymentMade", async (req, res) => {
    const event = req.body;

    switch (event.type) {
        case "charge.succeeded":
            const charge = event.data.object;
            console.log(charge)
            handle(charge.object.amount, charge.email)
            break;
        //// case "payment_method.attached":
        ////    const payment_method = event.data.object;
        ////   console.log(payment_method)
        //// break;
        //  case "customer.created":
        //     const customer = event.data.object;
        //    console.log(customer)
        //   break;
        ////   case "checkout.session.completed":
        ////      const checkout_completed = event.data.object;
        ////     console.log(checkout_completed)
        ////    break;
        case "customer.updated":
            const customerupdated = event.data.object;
            console.log(customerupdated)
            break;
        ////    case "invoice.created":
        ////       const invoice = event.data.object;
        ////      console.log(invoice)
        ////     break;
        ////  case "invoice.finalized":
        ////      const invoice_f = event.data.object;
        ////     console.log(invoice_f)
        ////    break;
        //  case "customer.subscription.created":
        //     const subscription = event.data.object;
        //    console.log(subscription)
        //   break;
        ////  case "invoice.updated":
        ////     const invoiceU = event.data.object;
        ////    console.log(invoiceU)
        ////   break;
        ////case "invoice.paid":
        ////  const invoiceP = event.data.object;
        ////  console.log(invoiceP)
        ////   break;
        ////  case "invoice.payment_succeeded":
        ////     const payment_succeeded = event.data.object;
        ////    console.log(payment_succeeded)
        ////   break;
        case "customer.subscription.updated":
            const subscriptionU = event.data.object;
            console.log(subscriptionU)
            break;
        ////  case "payment_intent.succeeded":
        ////     const payment_intent = event.data.object;
        ////    console.log(payment_intent)
        ////   break;
        //// case "payment_intent.created":
        ////    const payment_intentC = event.data.object;
        ////   console.log(payment_intentC)
        ////  break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }


    //// Return a response to acknowledge receipt of the event
    res.json({received: true});
});

const handle = async (amountPaid: number, email: string) => {
    const user = (await (getUserModel()).find({email}))?.[0]
    const subscription = amountPaid === 4999 ? "basic" : amountPaid === 7999 ? "premium" : amountPaid === 0 ? "free" : "unchanged";
    let amount = (subscription === "basic" ? 5000 : subscription === "premium" ? 100000 : 0);
    if (user && subscription !== "unchanged") {
        user.subscription = subscription
        await user.save();
    } else amount = (amountPaid === 3999 ? 5000 : amountPaid === 2299 ? 2000 : amountPaid === 499 ? 400 : 0);
    amount && await amendTokens(user, amount, "subscribed to " + subscription)
}

export default router;





