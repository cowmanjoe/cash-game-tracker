# Multi-stage build for optimal image size
# Stage 1: Build the application
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Copy gradle files first for better caching
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle

# Download dependencies (this layer will be cached if dependencies don't change)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build the application
RUN gradle bootJar --no-daemon

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create a non-root user to run the application
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy the built jar from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Change ownership to the non-root user
RUN chown appuser:appuser app.jar

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 8080

# Set JVM options for containerized environment
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
