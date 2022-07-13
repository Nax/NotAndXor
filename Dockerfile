FROM node:18-alpine

WORKDIR /app

RUN apk add --update --no-cache \
  build-base \
  vips-dev \
  inotify-tools \
  python3

COPY docker-run.sh /usr/local/sbin/

EXPOSE 8080
EXPOSE 35729

ENTRYPOINT []
CMD ["/usr/local/sbin/docker-run.sh", "npm", "start"]
