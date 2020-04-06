### STAGE 1: Build ###
FROM node:12.16.1-stretch AS build
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Run ###
FROM bitnami/apache:2.4.43
COPY --from=build /usr/src/app/dist/ /app/
USER 0
RUN chown -R 1001 /app/
RUN \
  apt-get update \
  && apt-get -y install gettext-base \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
USER 1001

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /app/assets/env.template.js > /app/assets/env.js && /opt/bitnami/scripts/apache/run.sh"]
