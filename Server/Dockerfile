FROM node:20-alpine

WORKDIR /app

ARG EVENTOR_API_KEY_SE
ARG EVENTOR_API_KEY_AU
ARG SLACK_WEBHOOK
ARG REDIS_HOST
ARG REDIS_PASSWORD
ARG BASEROW_KEY
ARG BASEROW_TABLE

ENV EVENTOR_API_KEY_SE $EVENTOR_API_KEY_SE
ENV EVENTOR_API_KEY_SE $EVENTOR_API_KEY_AU
ENV SLACK_WEBHOOK $SLACK_WEBHOOK
ENV REDIS_HOST $REDIS_HOST
ENV REDIS_PASSWORD $REDIS_PASSWORD
ENV BASEROW_KEY $BASEROW_KEY
ENV BASEROW_TABLE $BASEROW_TABLE
ENV ENV DEV

# Build folders
ADD ./src ./src

# Build files
ADD ./package.json ./
ADD ./package-lock.json ./
ADD ./tsconfig.json ./

RUN npm i

CMD ["npm", "run", "start"]