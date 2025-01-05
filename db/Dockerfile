# syntax=docker/dockerfile:1

FROM golang:1.23

WORKDIR /app

COPY . .

RUN go build -o pocketbase .

CMD ["/app/start.sh"]