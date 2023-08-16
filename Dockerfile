# syntax=docker/dockerfile:experimental
# BUILD IMAGE
FROM node:16-alpine
WORKDIR /opt/quantel-browser-plugin
COPY . .
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN yarn install --check-files --frozen-lockfile
RUN yarn install --check-files --frozen-lockfile --production --force # purge dev-dependencies
RUN apk del .build-deps

# DEPLOY IMAGE
FROM node:16-alpine
RUN apk add --no-cache tzdata
COPY --from=0 /opt/quantel-browser-plugin /opt/quantel-browser-plugin
WORKDIR /opt/quantel-browser-plugin
CMD ["yarn", "start"]
