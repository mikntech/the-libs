import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Query {
    "A simple type for getting started!"
    hello: String
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): User
  }

  type Subscription {
    jobCompleted: String
  }
`;

export default typeDefs;
