FROM node:lts as build-stage

RUN mkdir /fia-bot
COPY . /fia-bot
WORKDIR /fia-bot/

RUN npm ci --ignore-scripts

RUN npm run build

FROM node:lts-alpine as runner

ENV MONGO="mongodb://mongo:27017/"
ENV DB="fia"
ENV FETCH=60
ENV PERMS=34359756800
ENV IMG="https://fia.ort.dev/"

COPY --from=build-stage /fia-bot .

RUN npm ci --only-production --ignore-scripts

CMD node build/main.js