# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first (Docker layer cache optimisation)
COPY package*.json ./
RUN npm ci --silent

# Copy source and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine

# Copy built React app
COPY --from=build /app/build /usr/share/nginx/html

# Custom nginx config (handles React Router + API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
