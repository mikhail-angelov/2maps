FROM node:21-alpine
RUN apk add nano curl
ENV NODE_ENV=production

WORKDIR /opt/app
COPY ./package*.json ./
COPY ./dist dist
COPY ./ui ui
# RUN chown -R node:node /opt/app
# USER node
RUN npm ci --only=production
# COPY --chown=node:node . .