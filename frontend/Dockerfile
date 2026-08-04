# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN DISABLE_ESLINT_PLUGIN=true npm run build


# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
