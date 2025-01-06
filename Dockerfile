FROM node:20-alpine AS builder
WORKDIR /staging
COPY . /staging/

RUN corepack enable && \
    pnpm install --frozen-lockfile && \
    pnpm build && \
    pnpm prune --prod


FROM golang:1.23 AS go-build

WORKDIR /db

COPY ./db /db
RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -o /db/pocketbase

RUN /db/pocketbase superuser upsert admin@admin.com password123


FROM node:20-alpine
WORKDIR /app

COPY --from=go-build /db/pocketbase /app/db/pocketbase
COPY --from=builder /staging/start.sh /staging/package.json /staging/pnpm-lock.yaml  /app/
COPY --from=builder /staging/node_modules /app/node_modules
COPY --from=builder /staging/build /app/build

RUN /app/db/pocketbase superuser upsert admin@admin.com password123

CMD ["sh", "/app/start.sh"]