FROM node:18.20.4 AS base
WORKDIR /app
COPY package.json ./
RUN npm i --legacy-peer-deps
