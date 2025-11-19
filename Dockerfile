# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# Install pnpm
RUN npm install -g pnpm

RUN pnpm install

COPY . .

# Build the application
RUN npm run build:example

# Production stage
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist-example /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

