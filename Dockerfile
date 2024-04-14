# Set the base image to use for subsequent instructions
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Expose the port on which the application will run
EXPOSE 8000

# Command to run the application
CMD [ "npm", "start" ]
