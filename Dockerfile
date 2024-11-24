FROM node:23.1.0-alpine

WORKDIR /app

COPY package.json ./

RUN npm update
COPY . .

RUN apk add --no-cache bash curl && curl -1sLf \
  'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash \
  && apk add infisical
RUN npm install -g ts-node typescript

EXPOSE 3000
CMD ["npm", "run", "prod"]