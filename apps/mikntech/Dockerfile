ARG DEP_HASH
FROM 654654441147.dkr.ecr.ca-central-1.amazonaws.com/mikmn/base:$DEP_HASH AS base

FROM base AS builder
WORKDIR /app
COPY . .
RUN npx nx build mikntech

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/mikntech/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/apps/mikntech/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/mikntech/.next/standalone/apps/mikntech ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/mikntech/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
