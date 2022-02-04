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


npm ERR! FetchError: request to http://localhost:4873/@private%2fnode-red-contrib-komfovent failed, reason: connect ECONNREFUSED 127.0.0.1:4873
https://stackoverflow.com/questions/64431235/connect-to-localhost-in-dockerfile-build

https://knolleary.net/2018/06/01/creating-a-node-red-deployment-pipeline-to-ibm-cloud/

Your flow credentials file is encrypted using a system-generated key.

If the system-generated key is lost for any reason, your credentials
file will not be recoverable, you will have to delete it and re-enter
your credentials.

You should set your own key using the 'credentialSecret' option in
your settings file. Node-RED will then re-encrypt your credentials
file using your chosen key the next time you deploy a change.