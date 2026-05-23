FROM node:22-alpine AS build

WORKDIR /app

# Optimisation : Copier package files d'abord (meilleur cache Docker)
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build avec plus de mémoire pour les gros projets
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build -- --configuration=production

# Stage 2 : Serveur Nginx
FROM nginx:alpine

# Installer wget pour le healthcheck et outils utiles
RUN apk add --no-cache wget curl

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 101 -S nginx && adduser -S nginx -G nginx

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build --chown=nginx:nginx /app/dist/shoolapp/browser /usr/share/nginx/html

# Exposition du port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]