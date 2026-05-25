FROM node:22-alpine AS build

WORKDIR /app

# Argument pour le base href (ex: /dauphin/, /college/)
ARG BASE_HREF=/
ENV BASE_HREF=$BASE_HREF

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Build avec le base href personnalisé
RUN npx ng build --configuration=production --base-href=$BASE_HREF

FROM nginx:alpine

RUN apk add --no-cache wget curl

COPY nginx.conf /etc/nginx/conf.d/default.conf

# CORRECTION N°1 : Nettoyage absolu du dossier d'accueil Nginx pour éviter les résidus d'anciens builds
RUN rm -rf /usr/share/nginx/html/*

# CORRECTION N°2 : On s'assure de copier le contenu du dossier browser. 
# Si Angular génère un sous-dossier à cause du base-href, assure-toi que ce chemin correspond bien à ta structure dist.
COPY --from=build /app/dist/shoolapp/browser /usr/share/nginx/html

EXPOSE 80

# Le healthcheck mis à jour (très bonne initiative pour index.html !)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]