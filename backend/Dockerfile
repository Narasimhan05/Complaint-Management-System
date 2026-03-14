# ─────────────────────────────────────────────────────────────────────
# Stage 1: BUILD
# Uses the full Maven + JDK image to compile and package the app.
# This image is large (~500MB) but only used during build.
# ─────────────────────────────────────────────────────────────────────
FROM maven:3.9.5-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml FIRST and download dependencies.
# Docker caches this layer — if pom.xml doesn't change,
# dependencies won't re-download on every build. Big speed win.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Now copy source code and build
COPY src ./src
RUN mvn package -DskipTests -B

# ─────────────────────────────────────────────────────────────────────
# Stage 2: RUN
# Uses only the JRE (much smaller, ~90MB).
# Only the compiled JAR is copied from Stage 1.
# Maven, source code, and build tools are NOT in this image.
# ─────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/complaint-management-*.jar app.jar

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

# JVM tuning for containers:
# -XX:+UseContainerSupport → respect Docker memory limits (not host RAM)
# -Djava.security.egd → faster startup (uses /dev/urandom for entropy)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
