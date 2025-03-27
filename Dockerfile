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

RUN CGO_ENABLED=0 GOOS=linux go build -o /db/run


FROM node:20-alpine
WORKDIR /app

COPY --from=go-build /db/run /var/lib/pocketbase/run
COPY --from=builder /staging/scripts/start.sh /staging/package.json /staging/pnpm-lock.yaml  /app/
COPY --from=builder /staging/node_modules /app/node_modules
COPY --from=builder /staging/build /app/build

ARG PB_EMAIL
ARG PB_PASSWORD

ENV PB_EMAIL=${PB_EMAIL?emailnotfound}
ENV PB_PASSWORD=${PB_PASSWORD?passwordnotfound}

RUN /var/lib/pocketbase/run superuser upsert $PB_EMAIL $PB_PASSWORD

CMD ["sh", "/app/start.sh"]