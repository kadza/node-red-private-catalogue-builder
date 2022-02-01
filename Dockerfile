FROM node:14-alpine

RUN apk add git openssh-client
WORKDIR /usr/src/app
COPY package*.json ./
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh,id=github npm install --no-fund --no-update-notifier
COPY . .

EXPOSE 4874

CMD [ "node", "index.js" ]