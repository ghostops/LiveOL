FROM node:10

WORKDIR /app

ENV ENV LIVE

ADD package.json package.json
ADD yarn.lock yarn.lock
RUN yarn install

ADD tsconfig.json .babelrc ./
ADD src src

RUN yarn build

EXPOSE 4000

CMD node ./build
