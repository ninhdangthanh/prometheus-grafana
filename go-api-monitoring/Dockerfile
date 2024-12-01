# Stage 1: Build the Go binary with Go 1.23.3
FROM golang:1.23.3 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Go source code into the container
COPY . .

# Set the environment variables to build for linux/amd64
ENV GOARCH=amd64
ENV GOOS=linux

# Build the Go binary
RUN go build -o go-api-monitoring .

# Stage 2: Create a minimal image to run the binary
FROM debian:bookworm-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the compiled Go binary from the builder image
COPY --from=builder /app/go-api-monitoring .

# Expose the port the application will run on
EXPOSE 8080

# Command to run the Go binary
CMD ["./go-api-monitoring"]
