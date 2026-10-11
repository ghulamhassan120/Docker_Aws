FROM node:20-alpine AS frontend-builder

COPY ./Frontend /app

WORKDIR /app

RUN npm install

RUN npm install build

FROM node:20-alpine

COPY ./Backend/ app

WORKDIR /app

RUN npm install

COPY --from=frontend-builder /app/dist /app/public
CMD ["node","server.js"]