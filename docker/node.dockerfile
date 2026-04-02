# Dockerfile for utility container for Node.JS CLI applications
# Use an official Node.js runtime as a parent image
FROM node:current-alpine3.22 AS build

# Set the working directory
WORKDIR /app

# Set user to node for security
USER node

# Run the application CLI
CMD ["sh"]
