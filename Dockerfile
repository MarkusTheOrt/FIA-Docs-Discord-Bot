FROM node:lts-alpine

ENV MONGO="mongodb://localhost:27017/"
ENV DB="fia"
ENV FETCH=60
ENV PERMS=34359756800
ENV IMG="https://fia.ort.dev/"
ENV TOKEN=""

RUN mkdir /fia-bot
COPY . /fia-bot
WORKDIR /fia-bot/

RUN npm install

CMD node src/index.js