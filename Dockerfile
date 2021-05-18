# stage 1
FROM node:14.17 as node
WORKDIR /app
COPY . .
RUN npx npm-force-resolutions
RUN npm install
RUN npm run build_staging
RUN ls /app/dist/dashboard-material

# stage 2
FROM nginx:alpine
COPY --from=node /app/dist/dashboard-material/assets/env/nginx.conf /etc/nginx/nginx.conf
COPY --from=node /app/dist/dashboard-material /usr/share/nginx/html
RUN ls /usr/share/nginx/html
EXPOSE 80