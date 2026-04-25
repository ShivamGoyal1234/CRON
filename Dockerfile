FROM node:20-alpine AS base

WORKDIR /app
RUN apk add --no-cache openssl
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder --chown=node:node /app /app
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
