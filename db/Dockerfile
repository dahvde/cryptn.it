#syntax=docker/dockerfile:1

FROM golang:1.23

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN chmod +x /app/start.sh

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/pocketbase

RUN /app/pocketbase superuser upsert admin@admin.com password123

CMD ["./pocketbase", "serve", "--http", "0.0.0.0:8090"]