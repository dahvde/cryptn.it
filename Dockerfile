FROM node:20-alpine AS builder
WORKDIR /staging
COPY . /staging/

RUN corepack enable && \
    pnpm install --frozen-lockfile && \
    pnpm build && \
    pnpm prune --prod


FROM node:20-alpine
WORKDIR /app
COPY --from=builder /staging/package.json /staging/pnpm-lock.yaml  /app/
COPY --from=builder /staging/node_modules /app/node_modules
COPY --from=builder /staging/build /app/build

CMD ["node", "/app/build/index.js"]