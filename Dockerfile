FROM oven/bun:1.1.28-debian

WORKDIR /app

COPY package.json .

COPY bun.lockb .

RUN bun install

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "start"]
