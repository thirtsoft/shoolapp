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

COPY --from=build /app/dist/shoolapp/browser /usr/share/nginx/html

EXPOSE 80

# CORRECTION : On cible directement index.html pour s'assurer que Nginx sert bien le fichier
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]