import {RedisPubSub} from "graphql-redis-subscriptions";
import * as process from "process";
import Queue from 'bull';
import Redis from 'ioredis';
import dotenv from "dotenv"
import {OpenAIJob} from "@failean/shared-types";

dotenv.config()

const redisConnectionString = process.env.AZURE_REDIS_CONNECTIONSTRING + "";


export const openAIQueue = new Queue<OpenAIJob>('openAIQueue', redisConnectionString);


const pubsub = new RedisPubSub({
    publisher: new Redis(redisConnectionString),
    subscriber: new Redis(redisConnectionString)
});

console.log("trying to connect to Redis.....");

pubsub.getSubscriber().on("connect", () => {
    console.log("Subscriber connected to Redis");
});

pubsub.getSubscriber().on("error", (error) => {
    console.error("Subscriber failed to connect to Redis", error);
});


export default pubsub;
