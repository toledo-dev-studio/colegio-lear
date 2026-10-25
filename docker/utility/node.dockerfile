# Dockerfile for utility container for Node.JS CLI applications
# Use an official Node.js runtime as a parent image
FROM node:alpine3.22

# Install pnpm to use it as package manager
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Set user to node for security
USER node

# Run the application CLI
CMD ["sh"]
