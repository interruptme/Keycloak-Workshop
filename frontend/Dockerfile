# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Set environment variables for the build
ENV VITE_API_URL=http://localhost:5000
ENV VITE_KEYCLOAK_URL=http://localhost:8080
ENV VITE_KEYCLOAK_REALM=demo-realm
ENV VITE_KEYCLOAK_CLIENT_ID=frontend-client

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Copy built assets from the build stage
COPY --from=build /app/dist .

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]