FROM node:22.14.0-alpine AS builder

#  Set the working directory to /app inside the container
WORKDIR /app

# Install app dependencies
COPY ./package*.json ./

# Assign permissions to npm folder
RUN mkdir /.npm && chmod 777 /.npm

# Install dependencies (npm ci makes sure the exact versions in the lockfile gets installed)
RUN npm ci

# Copy app files
COPY . .

# Build
RUN npm run build

# Non-privileged user
USER app

# Expose Port
EXPOSE 3000

# Have only the compiled app, ready for production with Nginx
FROM nginx:1.27-alpine as production-stage
RUN mkdir /app
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]

RUN apk add --no-cache curl

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/
