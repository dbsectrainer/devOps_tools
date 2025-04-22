# Docker Cheatsheet

*This cheatsheet provides a reference for Docker commands, Dockerfile syntax, and best practices.*

## Basic Commands
```bash
# Container Management
docker run <image>              # Run a container
docker start <container>        # Start container
docker stop <container>         # Stop container
docker restart <container>      # Restart container
docker rm <container>          # Remove container
docker rm -f <container>       # Force remove running container

# Container Inspection
docker ps                      # List running containers
docker ps -a                   # List all containers
docker logs <container>        # View container logs
docker inspect <container>     # Inspect container
docker stats                   # View container resource usage
docker top <container>        # View container processes

# Image Management
docker images                  # List images
docker pull <image>           # Pull image from registry
docker push <image>           # Push image to registry
docker rmi <image>            # Remove image
docker build -t <name> .      # Build image from Dockerfile
docker tag <image> <new>      # Tag image
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
docker network create <network>    # Create network
docker network ls                  # List networks
docker network inspect <network>   # Inspect network
docker network rm <network>        # Remove network
docker network connect <network> <container>     # Connect container to network
docker network disconnect <network> <container>  # Disconnect container from network

# Network Drivers
docker network create --driver bridge my-network      # Bridge network
docker network create --driver overlay my-network     # Overlay network
docker network create --driver host my-network        # Host network
```

## Volume Commands
```bash
# Volume Management
docker volume create <volume>     # Create volume
docker volume ls                  # List volumes
docker volume inspect <volume>    # Inspect volume
docker volume rm <volume>         # Remove volume
docker volume prune              # Remove unused volumes

# Volume Usage
docker run -v <volume>:/path/in/container <image>    # Mount volume
docker run -v $(pwd):/app <image>                    # Bind mount
```

## Container Runtime Options
```bash
# Resource Constraints
docker run --memory="512m" <image>          # Memory limit
docker run --cpus="1.5" <image>             # CPU limit
docker run --pids-limit=100 <image>         # Process limit

# Port Mapping
docker run -p 8080:80 <image>              # Port mapping
docker run -P <image>                       # Auto port mapping

# Environment Variables
docker run -e "VAR=value" <image>          # Set environment variable
docker run --env-file=.env <image>         # Use env file

# Restart Policies
docker run --restart=always <image>         # Always restart
docker run --restart=unless-stopped <image> # Restart unless stopped
docker run --restart=on-failure:3 <image>   # Restart on failure
```

## Docker Registry
```bash
# Registry Operations
docker login                     # Login to registry
docker logout                    # Logout from registry
docker search <term>             # Search registry
docker pull registry:2           # Pull registry image
docker tag local/app registry/app:v1   # Tag for registry
docker push registry/app:v1            # Push to registry
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
docker logs --tail 100 <container>          # View last 100 log lines
docker logs -f <container>                  # Follow log output
docker exec -it <container> /bin/bash       # Interactive shell
docker inspect --format='{{.State.Status}}' <container>  # Get container status

# Clean Up
docker system prune                         # Remove unused data
docker system prune -a                      # Remove all unused data
docker system df                            # View disk usage
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/) - Official Docker image registry
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/security/)
- [DevOps Glossary](../cheatsheets/devops_glossary.md)
