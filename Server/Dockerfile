FROM node:20-alpine

WORKDIR /app

# Build folders
ADD ./src /app/src

# Build files
ADD ./package.json package.json
ADD ./package-lock.json package-lock.json
ADD ./tsconfig.json tsconfig.json
ADD ./drizzle.config.ts drizzle.config.ts
ADD ./drizzle drizzle
ADD ./runJob.ts runJob.ts

RUN npm i
RUN npm install -g ts-node tsconfig-paths nodemon tsx

CMD ["sh", "-c", "exec ts-node -r tsconfig-paths/register src/index.ts"]