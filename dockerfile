FROM pozylon/meteor-docker-auto as bundler
ADD . /source
WORKDIR /source
RUN meteor npm install && \
  meteor build --allow-superuser --directory /bundle

FROM node:12-alpine as rebuilder
RUN apk add --no-cache make gcc g++ python sudo
RUN adduser -D -u 501 -h /home/meteor meteor
COPY --from=bundler /bundle /rebuild
WORKDIR /rebuild/bundle/programs/server
RUN npm install && npm run install --production

FROM node:12-alpine as runtime
RUN adduser -D -u 501 -h /home/meteor meteor
COPY --from=rebuilder /rebuild/bundle /webapp
WORKDIR /webapp

ENV PORT 3000
EXPOSE 3000
USER meteor
CMD node main.js