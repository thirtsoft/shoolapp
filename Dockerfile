# ============================================================
# BUILD STAGE
# ============================================================
FROM node:22-alpine AS build

WORKDIR /app

# Installer les dépendances de manière reproductible
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY . .

# Build Angular production
RUN npx ng build --configuration=production


# ============================================================
# RUNTIME STAGE
# ============================================================
FROM nginx:alpine

# wget utilisé par le healthcheck Docker Compose
RUN apk add --no-cache wget

# Configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nettoyer le contenu Nginx par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier le build Angular
COPY --from=build /app/dist/shoolapp/browser /usr/share/nginx/html

# Port HTTP Nginx
EXPOSE 80

# Démarrage Nginx
CMD ["nginx", "-g", "daemon off;"]