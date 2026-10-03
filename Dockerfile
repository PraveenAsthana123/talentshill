FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 thgroup && adduser --system --uid 1001 thuser
COPY --from=builder --chown=thuser:thgroup /app/.next/standalone ./
COPY --from=builder --chown=thuser:thgroup /app/.next/static ./.next/static
COPY --from=builder --chown=thuser:thgroup /app/public ./public
COPY --from=builder --chown=thuser:thgroup /app/data ./data
USER thuser
EXPOSE 3000
ENV PORT=3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
