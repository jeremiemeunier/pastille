FROM node:20
ARG 0.1.1-dev

WORKDIR /app
COPY package.json ./
RUN npm i

COPY . .
CMD [ "node", "index.js" ]