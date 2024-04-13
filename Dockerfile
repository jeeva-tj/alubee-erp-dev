# Use the official lightweight Node.js image.
FROM node:18-slim
 
# Create and change to the app directory.
WORKDIR /usr/src/app/backend
 
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./
 
 
# RUN npm ci --only=production
RUN npm install --only=production
 
# Set the environmental variable for JWT token
ENV JWT_SECRET="12345"
ENV NODE_ENV="development"

# Copy local code to the container image.
COPY . ./
 
# Run the web service on container startup.
CMD [ "node", "server.js" ]