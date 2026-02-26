FROM oven/bun:latest
WORKDIR /usr/src/app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY prisma ./prisma
RUN bunx prisma generate

COPY . .

EXPOSE 5000
CMD ["bun", "run", "src/server.ts"]
