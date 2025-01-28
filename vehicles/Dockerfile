#  Build container
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
ENV VEHICLES_API_LOG_LEVEL ${VEHICLES_API_LOG_LEVEL}
ENV VEHICLES_API_TYPEORM_LOG_LEVEL ${VEHICLES_API_TYPEORM_LOG_LEVEL}
ENV VEHICLES_API_MAX_QUERY_EXECUTION_TIME_MS ${VEHICLES_API_MAX_QUERY_EXECUTION_TIME_MS}
ENV VEHICLES_API_MSSQL_MAX_CONNECTION ${VEHICLES_API_MSSQL_MAX_CONNECTION}
ENV MSSQL_HOST ${MSSQL_HOST}
ENV MSSQL_PORT ${MSSQL_PORT}
ENV MSSQL_DB ${MSSQL_DB}
ENV MSSQL_SA_USER ${MSSQL_SA_USER}
ENV MSSQL_SA_PASSWORD ${MSSQL_SA_PASSWORD}
ENV MSSQL_ENCRYPT ${MSSQL_ENCRYPT}
ENV KEYCLOAK_ISSUER_URL ${KEYCLOAK_ISSUER_URL}
ENV KEYCLOAK_AUDIENCE ${KEYCLOAK_AUDIENCE}
ENV KEYCLOAK_IGNORE_EXP ${KEYCLOAK_IGNORE_EXP}
ENV ACCESS_API_URL ${ACCESS_API_URL}
ENV DOPS_URL ${DOPS_URL}
ENV FRONTEND_URL ${FRONTEND_URL}
ENV PAYBC_API_KEY ${PAYBC_API_KEY}
ENV PAYBC_REF_NUMBER ${PAYBC_REF_NUMBER}
ENV PAYBC_BASE_URL ${PAYBC_BASE_URL}
ENV GL_CODE ${GL_CODE}
ENV PAYBC_REDIRECT ${PAYBC_REDIRECT}
ENV ORBC_SERVICE_ACCOUNT_CLIENT_ID ${ORBC_SERVICE_ACCOUNT_CLIENT_ID}
ENV ORBC_SERVICE_ACCOUNT_AUDIENCE ${ORBC_SERVICE_ACCOUNT_AUDIENCE}
ENV CFS_CREDIT_ACCOUNT_URL ${CFS_CREDIT_ACCOUNT_URL}
ENV CFS_CREDIT_ACCOUNT_CLIENT_ID ${CFS_CREDIT_ACCOUNT_CLIENT_ID}
ENV CFS_CREDIT_ACCOUNT_CLIENT_SECRET ${CFS_CREDIT_ACCOUNT_CLIENT_SECRET}
ENV BCGOV_FAX_EMAIL ${BCGOV_FAX_EMAIL}

# Copy production files from build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN apk add --no-cache curl

# Expose Port
EXPOSE 5000

# Non-root user
USER node

# Start the app
CMD ["npm", "run", "start:prod"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:5000/
