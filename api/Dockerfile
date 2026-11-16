# Image de production de l'API Kartnet.
# Construction : docker build -t kartnet-api ./api
# (ou, depuis la racine : docker compose --profile full up -d --build)

# ── Étape 1 : installer et compiler ─────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# ── Étape 2 : image finale, sans les sources TypeScript ─────
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json prisma.config.ts ./
COPY prisma ./prisma

RUN mkdir -p uploads && chown -R node:node uploads
USER node

EXPOSE 3000
# Applique les migrations en attente, puis démarre l'API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
