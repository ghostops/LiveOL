FROM node:10

WORKDIR /app

ARG EVENTOR_API_KEY
ARG SLACK_WEBHOOK

ENV EVENTOR_API_KEY $EVENTOR_API_KEY
ENV SLACK_WEBHOOK $SLACK_WEBHOOK
ENV ENV LIVE

ADD package.json package.json
ADD yarn.lock yarn.lock
RUN yarn install

ADD tsconfig.json .babelrc ./
ADD src src

RUN yarn build

EXPOSE 4000

CMD node ./build
