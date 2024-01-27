FROM node:20.5-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY tsconfig.json ./tsconfig.json
RUN ls -a
RUN npm install --frozen-lockfile
RUN npm run build

## this is stage two , where the app actually runs
FROM node:20.5-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile --production=true
COPY --from=0 /app/dist ./dist
EXPOSE 443
EXPOSE 8080
CMD ["npm", "start"]