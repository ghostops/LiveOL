FROM node:20-alpine

RUN apk add --no-cache tini

WORKDIR /app

ARG SLACK_WEBHOOK
ARG REDIS_HOST
ARG REDIS_PASSWORD
ARG GOOGLE_GENAI_API_KEY
ARG DATABASE_URL

ENV SLACK_WEBHOOK=$SLACK_WEBHOOK
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_PASSWORD=$REDIS_PASSWORD
ENV ENV=DEV
ENV GOOGLE_GENAI_API_KEY=$GOOGLE_GENAI_API_KEY
ENV DATABASE_URL=$DATABASE_URL

# Build folders
ADD ./src ./src

# Build files
ADD ./package.json ./
ADD ./package-lock.json ./
ADD ./tsconfig.json ./

RUN npm i

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npx", "nodemon", "-L", "-e", "ts", "-w", "./src", "-x", "npm", "run", "start", "|", "npx", "pino-pretty"]