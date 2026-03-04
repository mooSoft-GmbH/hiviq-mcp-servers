FROM alpine:3.22 AS compress
RUN apk --no-cache add upx
COPY .bun-binary /tmp/bun
RUN upx --best /tmp/bun

FROM alpine:3.22
RUN apk --no-cache add libgcc libstdc++ \
    && adduser -D -u 1000 app
COPY --from=compress /tmp/bun /usr/local/bin/bun
COPY node_modules/ ./node_modules/
COPY src/ ./src/
ENV MCP_TRANSPORT=http
ENV MCP_PORT=3000
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
EXPOSE 3000
USER app
HEALTHCHECK --interval=15s --timeout=5s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["bun", "src/index.ts"]
