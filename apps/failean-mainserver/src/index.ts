import dotenv from "dotenv";
import {createServer} from "http";
import {execute, subscribe} from "graphql";
import {useServer} from "graphql-ws/lib/use/ws";
import {Server} from "ws";
import {apolloServer, schema} from "./app/setup/graphqlSetup";
import {app, port} from "./app/setup/expressSetup";
import mongoSetup from "./app/setup/mongoSetup";
import scheduleAll from "./app/scheduled/scheduleder";
import {PromptName, WhiteModels} from "@failean/shared-types";
import * as process from "process";

dotenv.config();


process.env.NODE_ENV !== "development" && require("newrelic");

const connectApolloServer = async () => {
    await apolloServer.start();
    apolloServer.applyMiddleware({app});

    const httpServer = createServer(app);
    const wsServer = new Server({
        server: httpServer,
        path: "/graphql",
    });

    useServer(
        {
            schema,
            execute,
            subscribe,
            onConnect: () => {
                console.log("Client connected");
            },
            onSubscribe: () => {
                console.log("Received new subscription");
            },
        },
        wsServer
    );

    httpServer.listen(port, "0.0.0.0", () => {
        /*console.log(
                `Server is ready at http://localhost:${port}${apolloServer.graphqlPath}`
            );
            console.log(`Subscriptions ready at ws://localhost:${port}/graphql`);*/
    });
};

const setup = async () => {
    try {
        await connectApolloServer();
    } catch (error) {
        // console.error(error);
    }
};

mongoSetup().then(() => {
    setup();
});

setTimeout(() => scheduleAll(), 600000);
