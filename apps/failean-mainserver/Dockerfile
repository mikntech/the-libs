ARG DEP_HASH
FROM 654654441147.dkr.ecr.ca-central-1.amazonaws.com/mikmkmn/base:$DEP_HASH AS base

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run build:mikntech-mn

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/mikntech-mn/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/apps/mikntech-mn/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/mikntech-mn/.next/standalone/apps/mikntech-mn ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/mikntech-mn/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
