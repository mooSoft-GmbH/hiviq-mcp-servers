FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-alpine AS runtime
WORKDIR /app

# Copy installed dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/

# MCP_TRANSPORT=http activates the HTTP server
ENV MCP_TRANSPORT=http
ENV MCP_PORT=3000

EXPOSE 3000

# Non-root user for security
USER bun

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["bun", "src/index.ts"]
