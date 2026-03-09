# Use the official Node.js image as the base image
FROM node:20 AS build
LABEL stage=build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY backend/package*.json ./

RUN npm install -g pnpm

# Install the application dependencies
RUN pnpm install --no-cache

# Copy the rest of the application files
COPY backend/. .

# Build the NestJS application
RUN pnpm run build

# --- STAGE 2: PRODUCTION (Use a minimal, secure runtime image) ---
FROM node:20-slim AS production
LABEL stage=production

ENV NODE_ENV production
ENV PORT 5000

WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
# 1. Package.json
COPY --from=build /app/package*.json ./
# 2. Production files (dist folder, node_modules)
COPY --from=build /app/dist ./dist

# Install ONLY production dependencies
RUN npm install --only=production

# Expose the application port
EXPOSE 5000

# Command to run the application
CMD ["node", "dist/main"]
