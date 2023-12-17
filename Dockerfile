FROM node:20-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app
COPY package.json ./
RUN npm i

COPY . .
CMD [ "node", "index.js" ]

# Add metadata to image:
LABEL org.opencontainers.image.title="pastille-bot"
LABEL org.opencontainers.image.vendor="Jeremie Meunier"
LABEL org.opencontainers.image.authors="Jeremie Meunier"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.description="A multipurpose discord bot"
LABEL org.opencontainers.image.url="https://github.com/jeremiemeunier"
LABEL org.opencontainers.image.documentation="https://github.com/jeremiemeunier/pastille-bot/README.md"
LABEL org.opencontainers.image.source="https://github.com/jeremiemeunier/pastille-bot"