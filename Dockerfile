FROM node:12.13-alpine
RUN apk add man man-pages lsof lsof-doc less less-doc nano nano-doc curl nginx
ENV NODE_ENV=production

WORKDIR /opt/app
COPY ./package*.json /opt/app/
COPY ./dist dist
COPY ./ui/public ui/public
RUN chown -R node:node /opt/app
USER node
RUN npm ci --only=production
COPY --chown=node:node . .