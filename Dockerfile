# Multi-stage lightweight build for Aether Sanctuary
# Step 1: Compile with JDK 21 Alpine
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY AetherServer.java .
RUN javac -d bin AetherServer.java

# Step 2: Ultra-lean minimal runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled classes & public web assets
COPY --from=builder /app/bin ./bin
COPY public ./public

# Environment variables
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/status || exit 1

# Launch the sanctuary server
CMD ["java", "-cp", "bin", "com.aether.AetherServer"]
