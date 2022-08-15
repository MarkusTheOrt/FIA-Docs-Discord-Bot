FROM node:lts-alpine as build-stage

RUN mkdir /fia-docs
COPY . /fia-docs
WORKDIR /fia-docs/

RUN npm install
RUN npm run build