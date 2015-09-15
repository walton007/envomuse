FROM daocloud.io/node:0.10
MAINTAINER envomuse-walton, envomuse-hkfs15

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g mean-cli bower gulp

RUN     groupadd -r node \
&&      useradd -r -m -g node node

COPY ./bower.json /usr/src/app/bower.json
COPY ./package.json /usr/src/app/package.json
USER node
RUN touch /home/node/.mean
RUN bower install
RUN npm install --production

#Copy whole file
COPY . /usr/src/app/

#chown need root privilige
USER root
RUN chown -R node:node /usr/src/app

USER node
ENV PORT 3000
ENV DB_PORT_27017_TCP_ADDR db
EXPOSE 3000

CMD [ "npm", "start" ]