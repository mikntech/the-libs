FROM node:20.18.1 AS base
WORKDIR /app
COPY package.json ./
RUN npm i --legacy-peer-deps
