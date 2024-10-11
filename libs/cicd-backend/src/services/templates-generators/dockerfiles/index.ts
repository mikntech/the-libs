interface Options {
  nodeTag: string;
  log: boolean;
  customInstallLine?: string;
  customBuildLine?: string;
  customEntryPointExtension?: string;
}

export const generateBaseDockerfile = (
  options: Partial<
    Omit<Options, 'customBuildLine' | 'customEntryPointExtension'>
  >,
) => {
  let { nodeTag, log, customInstallLine } = options;
  if (nodeTag === undefined) nodeTag = 'lts';
  if (log === undefined) log = true;
  const ret = `
FROM node:${nodeTag} AS base
WORKDIR /app
COPY package.json ./
${customInstallLine ?? 'RUN npm i'}
`;
  log && console.log(ret);
  return ret;
};

export const generateCustomServerDockerfile = (
  options: Partial<Omit<Options, 'customInstallLine'>>,
  projectName: string,
  appName: string,
  ecrDomain: string,
  port: number,
) => {
  let { nodeTag, log, customBuildLine, customEntryPointExtension } = options;
  if (nodeTag === undefined) nodeTag = 'lts';
  if (log === undefined) log = true;
  const ret = `
ARG DEP_HASH
FROM ${ecrDomain}/mik${projectName}/base:$DEP_HASH as builder
WORKDIR /app
COPY package.json nx.json tsconfig.base.json ./
COPY libs/ libs/
COPY apps/${appName}/ apps/${appName}/
${customBuildLine ?? `RUN npm run build:${appName}`}

FROM node:${nodeTag}-slim
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "dist/apps/${appName}/index.${customEntryPointExtension ?? 'mjs'}"]
EXPOSE ${port}
`;
  log && console.log(ret);
  return ret;
};

export const generateStandaloneNextDockerfile = (
  options: Partial<
    Omit<Options, 'customInstallLine' | 'customEntryPointExtension'>
  >,
  appName: string,
) => {
  let { nodeTag, log, customBuildLine } = options;
  if (nodeTag === undefined) nodeTag = '21-alpine';
  if (log === undefined) log = true;
  const ret = `
FROM node:${nodeTag} AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json nx.json tsconfig.base.json ./
RUN npm i

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

${customBuildLine ?? `RUN npm run build:${appName}`}

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/${appName}/public ./public
COPY --from=builder /app/apps/${appName}/.next/standalone ./
COPY --from=builder /app/apps/${appName}/.next/static ./.next/static

RUN chown nextjs:nodejs .next
 
USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
`;
  log && console.log(ret);
  return ret;
};
