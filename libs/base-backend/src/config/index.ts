import { config } from "dotenv";
import * as process from "node:process";

config();

export enum NodeEnvironment {
  Development = "development",
  Production = "production",
}

export enum StagingEnvironment {
  Local = "local",
  Dev = "dev",
  Preprod = "pre",
  Prod = "prod",
}

export interface BaseSettings<CD> {
  nodeEnv: NodeEnvironment;
  stagingEnv: StagingEnvironment;
  port: number;
  mongoURI: string;
  clientDomains: CD;
  myDomain: string;
}

const validEnvs: NodeEnvironment[] = Object.values(NodeEnvironment);
const validStagingEnvs: StagingEnvironment[] =
  Object.values(StagingEnvironment);

const nodeEnv = process.env["NODE_ENV"] as NodeEnvironment;
if (!validEnvs.includes(nodeEnv)) {
  throw new Error("NODE_ENV must be 'development' or 'production'");
}

const stagingEnv = process.env["STAGING_ENV"] as StagingEnvironment;
if (!validStagingEnvs.includes(stagingEnv)) {
  throw new Error(
    `STAGING_ENV must be one of: ${Object.values(StagingEnvironment).join(", ")}`,
  );
}

const isProduction = nodeEnv === NodeEnvironment.Production;
const defaultStagingEnv = isProduction
  ? StagingEnvironment.Prod
  : StagingEnvironment.Local;

const port = parseInt(process.env["PORT"] ?? "4050");
const currentStagingEnv = stagingEnv || defaultStagingEnv;

const generateFullDomain = (base: string, port: string) => {
  return isProduction
    ? `https://${currentStagingEnv === StagingEnvironment.Prod ? "" : currentStagingEnv}${base}`
    : `http://localhost:${port}`;
};

const myDomain = generateFullDomain(
  process.env["MY_DOMAIN"] ?? "localhost",
  String(port),
);

export const getBaseSettings = <
  CB extends { [key: string]: string } = { single: string },
>(): BaseSettings<CB> => {
  const clientDomains: CB = JSON.parse(
    process.env["CLIENT_DOMAINS"] ?? JSON.stringify({ single: "my.co" }),
  );

  const mutableClientDomains = clientDomains as { [key: string]: string };

  Object.keys(mutableClientDomains).forEach((key) => {
    mutableClientDomains[key] = generateFullDomain(
      mutableClientDomains[key],
      String(process.env["CLIENT_PORT"] ?? 4100),
    );
  });

  return {
    nodeEnv: isProduction
      ? NodeEnvironment.Production
      : NodeEnvironment.Development,
    stagingEnv: currentStagingEnv,
    port,
    mongoURI:
      process.env["MONGO_URI"] ??
      (isProduction ? "" : "mongodb://localhost:27017/error"),
    myDomain,
    clientDomains: mutableClientDomains as CB,
  };
};

export const validateSettings = <CB>(settings: BaseSettings<CB>) => {
  if (!settings) {
    throw new Error("Configuration settings could not be loaded");
  } else {
    console.log("settings:", JSON.stringify(settings));
  }
};
