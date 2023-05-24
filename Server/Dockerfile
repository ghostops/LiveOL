FROM node:16-alpine

WORKDIR /app

# Build folders
ADD ./src ./src

# Build files
ADD ./package.json ./
ADD ./yarn.lock ./
ADD ./tsconfig.json ./

RUN yarn
RUN yarn build

CMD ["node", "./build"]