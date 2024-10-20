import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "../typeDefs";
import Query from "../resolvers/query";
import Mutation from "../resolvers/mutation";
import Subscription from "../resolvers/subscription";
import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core";
import pubsub from "./redisSetup";

const resolvers = {
  Query,
  Mutation,
  Subscription,
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

interface Context {
  req: Express.Request;
  res: Express.Response;
  pubsub: typeof pubsub;
}

const buildContext = ({
  req,
  res,
}: {
  req: Express.Request;
  res: Express.Response;
}): Context => {
  return { req, res, pubsub };
};

const configureApolloServer = (): ApolloServer => {
  const serverConfig = {
    schema,
    context: buildContext,
  };

  if (process.env.NODE_ENV === "production") {
    return new ApolloServer({
      ...serverConfig,
      plugins: [ApolloServerPluginLandingPageDisabled()],
    });
  }

  return new ApolloServer(serverConfig);
};

export const apolloServer = configureApolloServer();
