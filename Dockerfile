FROM node:16.3.0-alpine

WORKDIR /app

RUN apk add --update --no-cache \
  build-base \
  vips-dev \
  inotify-tools \
  python3

COPY docker-run.sh /usr/local/bin/
COPY app ./app
COPY assets ./assets
COPY builder ./builder
COPY babel.config.json build.js package.json yarn.lock ./

EXPOSE 8080

ENTRYPOINT []
CMD ["/usr/local/bin/docker-run.sh", "yarn", "start"]
