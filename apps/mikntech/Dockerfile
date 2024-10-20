FROM node:21-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./

# Install dependencies
RUN npm i

# Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Copy dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the entire app for build-time access
COPY . .

# Ensure next is available and build the app
RUN npm run build

# Production image, copy all the necessary files and prepare for runtime
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy over build artifacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/public ./.next/public

# Set proper ownership
RUN chown nextjs:nodejs .next
# mkdir .next &&


# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Runtime environment variables (you can still override these with docker run flags)
ENV PORT=3000

CMD ["node", "server.js"]
