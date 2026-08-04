FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests


FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/gestion-formation-1.0.0.jar app.jar

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

EXPOSE 8081

CMD ["java", "-jar", "app.jar"]
