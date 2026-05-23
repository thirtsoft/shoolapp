FROM node:22-alpine AS build

WORKDIR /app

# Copier package files
COPY package*.json ./

# Utiliser npm install avec legacy-peer-deps pour résoudre les conflits
RUN npm install --legacy-peer-deps --omit=dev

# Copier le code source
COPY . .

# Build
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build -- --configuration=production

# Stage 2 : Serveur Nginx
FROM nginx:alpine

# Installer wget pour le healthcheck
RUN apk add --no-cache wget curl

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/dist/shoolapp/browser /usr/share/nginx/html

# Exposition du port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]