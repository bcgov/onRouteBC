#  Build container.
FROM node:20.15.1-alpine AS builder

# Set the working directory to /app inside the container
WORKDIR /app

# Copy app files
COPY . ./

# Create and Assign permissions to npm folder
RUN mkdir /.npm && chmod 777 /.npm

ENV PUPPETEER_SKIP_CHROME_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROME_HEADLESS_SHELL_DOWNLOAD=true

# Install packages, build and keep only prod packages
RUN npm ci
RUN npm run build
RUN npm prune --production



# Deployment container
FROM node:20.15.1-alpine
RUN npm cache clean --force

# Create and Assign permissions to npm folder
RUN mkdir /.npm && chmod 777 /.npm
RUN mkdir /.cache && chmod 777 /.cache

# Set the working directory to /app inside the deployment container
WORKDIR /app

# Set node to production
ENV NODE_ENV ${NODE_ENV}

# Set environment variables
ENV DB_TYPE ${DB_TYPE}
ENV DOPS_API_LOG_LEVEL ${DOPS_API_LOG_LEVEL}
ENV DOPS_API_TYPEORM_LOG_LEVEL ${DOPS_API_TYPEORM_LOG_LEVEL}
ENV DOPS_API_MAX_QUERY_EXECUTION_TIME_MS ${DOPS_API_MAX_QUERY_EXECUTION_TIME_MS}
ENV DOPS_API_MSSQL_MAX_CONNECTION ${DOPS_API_MSSQL_MAX_CONNECTION}
ENV MSSQL_HOST ${MSSQL_HOST}
ENV MSSQL_PORT ${MSSQL_PORT}
ENV MSSQL_DB ${MSSQL_DB}
ENV MSSQL_SA_USER ${MSSQL_SA_USER}
ENV MSSQL_SA_PASSWORD ${MSSQL_SA_PASSWORD}
ENV MSSQL_ENCRYPT ${MSSQL_ENCRYPT}
ENV KEYCLOAK_ISSUER_URL ${KEYCLOAK_ISSUER_URL}
ENV KEYCLOAK_AUDIENCE ${KEYCLOAK_AUDIENCE}
ENV KEYCLOAK_IGNORE_EXP ${KEYCLOAK_IGNORE_EXP}
ENV DOPS_CVSE_FORMS_CACHE_TTL_MS ${DOPS_CVSE_FORMS_CACHE_TTL_MS}
ENV OCIO_S3_ACCESSKEYID ${OCIO_S3_ACCESSKEYID}
ENV OCIO_S3_BUCKET ${OCIO_S3_BUCKET}
ENV OCIO_S3_PRESIGNED_URL_EXPIRY ${OCIO_S3_PRESIGNED_URL_EXPIRY}
ENV OCIO_S3_ENDPOINT ${OCIO_S3_ENDPOINT}
ENV OCIO_S3_KEY ${OCIO_S3_KEY}
ENV OCIO_S3_SECRETACCESSKEY ${OCIO_S3_SECRETACCESSKEY}
ENV CHES_TOKEN_URL ${CHES_TOKEN_URL}
ENV CHES_CLIENT_ID ${CHES_CLIENT_ID}
ENV CHES_CLIENT_SECRET ${CHES_CLIENT_SECRET}
ENV CHES_URL ${CHES_URL}
ENV CDOGS_TOKEN_URL ${CDOGS_TOKEN_URL}
ENV CDOGS_CLIENT_ID ${CDOGS_CLIENT_ID}
ENV CDOGS_CLIENT_SECRET ${CDOGS_CLIENT_SECRET}
ENV CDOGS_URL ${CDOGS_URL}
ENV ACCESS_API_URL ${ACCESS_API_URL}
ENV DOPS_URL ${DOPS_URL}
ENV FRONTEND_URL ${FRONTEND_URL}
ENV ORBC_SERVICE_ACCOUNT_CLIENT_ID ${ORBC_SERVICE_ACCOUNT_CLIENT_ID}
ENV ORBC_SERVICE_ACCOUNT_AUDIENCE ${ORBC_SERVICE_ACCOUNT_AUDIENCE}

# Copy production files from build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      curl
     
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser


# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

# Expose Port
EXPOSE 5001

# Start the app
CMD ["npm", "run", "start:prod"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:5001/
