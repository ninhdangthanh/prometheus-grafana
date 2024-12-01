# Use the official Node.js image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose the app port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "dev"]
