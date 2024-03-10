FROM node:20-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
COPY package.json ./
RUN npm i

COPY . .
EXPOSE 3000

CMD [ "node", "--env-file=.env", "index.js" ]