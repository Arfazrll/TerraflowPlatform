# --- STAGE 1: BUILD ---
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install required system packages for building (if any)
RUN apk add --no-cache git

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# --- STAGE 2: RUNNER ---
FROM alpine:latest

WORKDIR /app

# Install CA certificates for HTTPS requests (Firebase)
RUN apk --no-cache add ca-certificates

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["./main"]
