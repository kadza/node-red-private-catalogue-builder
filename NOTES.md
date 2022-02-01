I think I'll just make an image instead of cloning the repo

It was necessary to add git and ssh configuration to make the build as there is an github npm dependency
Taken from: https://sanderknape.com/2019/06/installing-private-git-repositories-npm-install-docker/

```
FROM node:12-alpine

RUN apk add git openssh-client
WORKDIR /usr/src/app
COPY package*.json ./
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh,id=github npm install --no-fund --no-update-notifier
COPY . .

EXPOSE 80

CMD [ "node", "index.js" ]
```

```
DOCKER_BUILDKIT=1 docker build . -t kadzaa/node-red-catalogue:latest
```

/-/all endpoint doesn't work
https://blog.npmjs.org/post/157615772423/deprecating-the-all-registry-endpoint.html


fs.rmSync(tarPath) not defined
https://github.com/Jarred-Sumner/git-peek/issues/14

err Error: ENOENT: no such file or directory, mkdir 'temp/@private'