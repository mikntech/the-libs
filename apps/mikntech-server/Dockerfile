
ARG DEP_HASH
FROM 654654441147.dkr.ecr.ca-central-1.amazonaws.com/mikmn/base:$DEP_HASH as builder
WORKDIR /app
COPY package.json nx.json tsconfig.base.json ./
COPY libs/ libs/
COPY apps/mikntech-server/ apps/mikntech-server/
RUN npx nx build mikntech-server

FROM node:20.18.1-slim
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "dist/apps/mikntech-server/index.mjs"]
EXPOSE 4059
