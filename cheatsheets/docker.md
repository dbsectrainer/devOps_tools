# Docker Cheatsheet

*This cheatsheet provides a reference for Docker commands, Dockerfile syntax, and best practices.*

## Basic Commands
```bash
# Container Management
docker run <image>              # Create and start a new container from an image with optional configuration
docker start <container>        # Start a stopped container, preserving its configuration
docker stop <container>         # Stop a running container gracefully (SIGTERM, then SIGKILL)
docker restart <container>      # Stop and then start a container, useful for applying changes
docker rm <container>          # Remove a stopped container and its writable layer
docker rm -f <container>       # Force remove a container even if running (use with caution)

# Container Inspection
docker ps                      # List only running containers with basic info (ID, name, status)
docker ps -a                   # List all containers including stopped ones for troubleshooting
docker logs <container>        # View container output and error logs for debugging
docker inspect <container>     # Show detailed container configuration and runtime information
docker stats                   # Display live resource usage statistics (CPU, memory, network, I/O)
docker top <container>        # Show running processes inside a container for monitoring

# Image Management
docker images                  # List all locally stored images with size and creation time
docker pull <image>           # Download an image from a registry (default: Docker Hub)
docker push <image>           # Upload an image to a registry after authentication
docker rmi <image>            # Remove a locally stored image to free space
docker build -t <name> .      # Build an image from a Dockerfile in current directory
docker tag <image> <new>      # Create a new tagged reference to an image for versioning
```

## Dockerfile Syntax
```dockerfile
# Basic Structure
FROM ubuntu:20.04
LABEL maintainer="name@example.com"
ENV APP_HOME=/app
WORKDIR $APP_HOME
COPY . .
RUN apt-get update && apt-get install -y nodejs
EXPOSE 3000
CMD ["npm", "start"]

# Multi-stage Build with Optimization
FROM node:22-alpine AS builder
WORKDIR /app
# Copy only package files first to leverage cache
COPY package*.json ./
RUN npm ci --only=production
# Copy source code and build
COPY . .
RUN npm run build

# Use distroless for minimal attack surface
FROM gcr.io/distroless/nodejs:22
WORKDIR /app
# Copy only production dependencies
COPY --from=builder /app/node_modules /app/node_modules
# Copy only build artifacts
COPY --from=builder /app/dist /app/dist
# Set non-root user
USER nonroot
EXPOSE 3000
CMD ["dist/main.js"]

# Multi-stage Build for Go Application
FROM golang:1.22-alpine AS builder
WORKDIR /app
# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download
# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

# Use scratch for minimal image
FROM scratch
COPY --from=builder /app/app /app
EXPOSE 8080
ENTRYPOINT ["/app"]
```

## Docker Compose
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: postgres:13
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
```

## Network Commands
```bash
# Network Management
docker network create <network>    # Create a new network for container isolation
docker network ls                  # List all networks with their drivers and scope
docker network inspect <network>   # Show detailed network configuration and connected containers
docker network rm <network>        # Remove an unused network
docker network connect <network> <container>     # Add a running container to a network
docker network disconnect <network> <container>  # Remove a container from a network

# Network Drivers
docker network create --driver bridge my-network      # Create isolated network for container communication
docker network create --driver overlay my-network     # Create multi-host network for swarm services
docker network create --driver host my-network        # Use host network stack directly (no isolation)
```

## Volume Commands
```bash
# Volume Management
docker volume create <volume>     # Create a named volume for persistent data storage
docker volume ls                  # List all volumes with their drivers
docker volume inspect <volume>    # Show volume details including mountpoint
docker volume rm <volume>         # Remove a volume when data is no longer needed
docker volume prune              # Remove all unused volumes to reclaim space

# Volume Usage
docker run -v <volume>:/path/in/container <image>    # Mount a named volume for persistent storage
docker run -v $(pwd):/app <image>                    # Mount current directory for development
```

## Container Runtime Options
```bash
# Resource Constraints
docker run --memory="512m" <image>          # Limit container memory usage to 512MB
docker run --cpus="1.5" <image>             # Limit container to 1.5 CPU cores
docker run --pids-limit=100 <image>         # Limit maximum number of processes

# Port Mapping
docker run -p 8080:80 <image>              # Map host port 8080 to container port 80
docker run -P <image>                       # Automatically map exposed ports to random host ports

# Environment Variables
docker run -e "VAR=value" <image>          # Set a single environment variable
docker run --env-file=.env <image>         # Load multiple environment variables from file

# Restart Policies
docker run --restart=always <image>         # Automatically restart container in all cases
docker run --restart=unless-stopped <image> # Restart container unless manually stopped
docker run --restart=on-failure:3 <image>   # Restart up to 3 times if exit code non-zero
```

## Docker Registry
```bash
# Registry Operations
docker login                     # Authenticate with a container registry
docker logout                    # Remove stored registry credentials
docker search <term>             # Search Docker Hub for images
docker pull registry:2           # Download the official registry image
docker tag local/app registry/app:v1   # Prepare image for registry push
docker push registry/app:v1            # Upload tagged image to registry
```

## Best Practices

1. **Image Building**
   ```dockerfile
   # Use specific base image versions
   FROM node:22-alpine

   # Minimize layers
   RUN apt-get update && apt-get install -y \
       package1 \
       package2 \
       && rm -rf /var/lib/apt/lists/*

   # Use .dockerignore
   # .dockerignore
   node_modules
   npm-debug.log
   Dockerfile
   .git
   ```

2. **Security**
   ```dockerfile
   # Run as non-root user
   RUN useradd -r -u 1001 -g appuser appuser
   USER appuser

   # Scan images for vulnerabilities
   docker scan myimage:latest

   # Use multi-stage builds to reduce attack surface
   FROM build AS builder
   # ... build steps ...
   FROM runtime
   COPY --from=builder /app/binary /app/binary
   ```

3. **Container Management**
   ```bash
   # Use health checks
   HEALTHCHECK --interval=5m --timeout=3s \
     CMD curl -f http://localhost/ || exit 1

   # Implement logging
   docker run --log-driver=json-file \
     --log-opt max-size=10m \
     --log-opt max-file=3 \
     <image>
   ```

4. **Docker Compose Best Practices**
   ```yaml
   version: '3.8'
   services:
     app:
       init: true                # Use init process
       healthcheck:              # Define health check
         test: ["CMD", "curl", "-f", "http://localhost"]
         interval: 30s
         timeout: 10s
         retries: 3
       deploy:                   # Define deploy constraints
         resources:
           limits:
             cpus: '0.50'
             memory: 512M
       logging:                  # Configure logging
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
   ```

5. **Development Workflow**
   ```bash
   # Use development containers
   docker run -v $(pwd):/app -v /app/node_modules <image>

   # Use docker-compose.override.yml
   # docker-compose.override.yml
   version: '3.8'
   services:
     app:
       volumes:
         - .:/app
       environment:
         - DEBUG=1
   ```

## Troubleshooting Commands
```bash
# Debugging
docker logs --tail 100 <container>          # Show most recent 100 log entries for debugging
docker logs -f <container>                  # Stream container logs in real-time
docker exec -it <container> /bin/bash       # Start interactive shell for container inspection
docker inspect --format='{{.State.Status}}' <container>  # Extract specific container state info

# Clean Up
docker system prune                         # Remove unused containers, networks, and dangling images
docker system prune -a                      # Remove all unused resources including unused images
docker system df                            # Show docker disk usage by type (containers, images, volumes)
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/) - Official Docker image registry
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/security/)
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
