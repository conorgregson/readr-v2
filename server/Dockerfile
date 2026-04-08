FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
COPY shared ./shared
COPY tsconfig.base.json ./tsconfig.base.json

RUN npm ci

COPY server ./server

WORKDIR /app/server

RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "dev"]
