# syntax=docker/dockerfile:experimental
# BUILD IMAGE
FROM node:12.16.1-alpine
WORKDIR /opt/quantel-browser-plugin
COPY . .
RUN yarn install --check-files --frozen-lockfile
RUN yarn install --check-files --frozen-lockfile --production --force # purge dev-dependencies

# DEPLOY IMAGE
FROM node:12.16.1-alpine
RUN apk add --no-cache tzdata
COPY --from=0 /opt/quantel-browser-plugin /opt/quantel-browser-plugin
WORKDIR /opt/quantel-browser-plugin
CMD ["yarn", "start"]
