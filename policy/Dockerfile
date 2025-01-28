#  Build container.
FROM node:20.15.1-alpine AS builder

# Set the working directory to /app inside the container
WORKDIR /app

# Copy app files
COPY . ./

# Create and Assign permissions to npm folder
RUN mkdir /.npm && chmod 777 /.npm

# Install packages, build and keep only prod packages
RUN npm ci
RUN npm run build
RUN npm prune --production



# Deployment container
FROM node:20.15.1-alpine
RUN npm cache clean --force

# Create and Assign permissions to npm folder
RUN mkdir /.npm && chmod 777 /.npm

# Set the working directory to /app inside the deployment container
WORKDIR /app

# Set node to production
ENV NODE_ENV ${NODE_ENV}

# Set environment variables
ENV DB_TYPE ${DB_TYPE}
ENV POLICY_API_LOG_LEVEL ${POLICY_API_LOG_LEVEL}
ENV POLICY_API_TYPEORM_LOG_LEVEL ${POLICY_API_TYPEORM_LOG_LEVEL}
ENV POLICY_API_MAX_QUERY_EXECUTION_TIME_MS ${POLICY_API_MAX_QUERY_EXECUTION_TIME_MS}
ENV POLICY_API_MSSQL_MAX_CONNECTION ${POLICY_API_MSSQL_MAX_CONNECTION}
ENV MSSQL_HOST ${MSSQL_HOST}
ENV MSSQL_PORT ${MSSQL_PORT}
ENV MSSQL_DB ${MSSQL_DB}
ENV MSSQL_SA_USER ${MSSQL_SA_USER}
ENV MSSQL_SA_PASSWORD ${MSSQL_SA_PASSWORD}
ENV MSSQL_ENCRYPT ${MSSQL_ENCRYPT}
ENV KEYCLOAK_ISSUER_URL ${KEYCLOAK_ISSUER_URL}
ENV KEYCLOAK_AUDIENCE ${KEYCLOAK_AUDIENCE}
ENV KEYCLOAK_IGNORE_EXP ${KEYCLOAK_IGNORE_EXP}
ENV ORBC_SERVICE_ACCOUNT_CLIENT_ID ${ORBC_SERVICE_ACCOUNT_CLIENT_ID}
ENV ORBC_SERVICE_ACCOUNT_AUDIENCE ${ORBC_SERVICE_ACCOUNT_AUDIENCE}

# Copy production files from build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN apk add --no-cache curl

# Expose Port
EXPOSE 5002

# Non-root user
USER node

# Start the app
CMD ["npm", "run", "start:prod"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:5002/