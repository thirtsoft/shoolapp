FROM node:22-alpine AS build

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le code source
COPY . .

# Build avec npx (utilise le ng local du projet)
RUN npx ng build --configuration=production

# Stage 2 : Serveur Nginx
FROM nginx:alpine

RUN apk add --no-cache wget curl

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/shoolapp/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]