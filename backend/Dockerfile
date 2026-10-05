FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Start the application using start script (node src/server.js)
CMD [ "npm", "start" ]
