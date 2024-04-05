FROM oven/bun:1.1.1-slim as base
WORKDIR /app
EXPOSE 80
EXPOSE 443
EXPOSE 3000

FROM oven/bun:1.1.1-slim AS build
ENV PUBLIC_DIR=public
WORKDIR /src
# install dependencies with cache
COPY Web/package.json .
COPY Web/bun.lockb .
RUN bun install --frozen-lockfile
# copy app files and build
COPY Web/ .
RUN bun run build

FROM base AS final
WORKDIR /app
COPY --from=build /src/dist .
COPY --from=build /src/node_modules node_modules/
COPY --from=build /src/package.json .
COPY --from=build /src/bun.lockb .
ENV NODE_ENV=production
ENTRYPOINT ["bun", "server/server.js"]