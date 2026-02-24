FROM node:18-alpine

WORKDIR /app

# Install postgresql client for pg_isready
RUN apk add --no-cache postgresql-client bash

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Copy wait script and make it executable
COPY wait-for-postgres.sh /app/wait-for-postgres.sh
RUN chmod +x /app/wait-for-postgres.sh

EXPOSE 3001

ENTRYPOINT ["/app/wait-for-postgres.sh", "postgres"]
CMD ["npm", "run", "start:prod"]
