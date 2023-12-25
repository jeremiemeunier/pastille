FROM node:20-slim

WORKDIR /app
COPY package.json ./
RUN npm i

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 3000

COPY . .
CMD [ "node", "index.js" ]