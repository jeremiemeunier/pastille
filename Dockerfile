FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm i

COPY . .
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app
COPY --from=builder /app/dist /app
COPY package*.json ./
RUN npm i

CMD [ "node", "index.js" ]