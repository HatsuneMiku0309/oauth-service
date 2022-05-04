FROM node:14.18.0

MAINTAINER cosmo

RUN apt-get update &&\
    apt-get install -y vim &&\
    npm install -g npm &&\
    npm install -g pm2 typescript &&\
    useradd -m oauth &&\
    unlink /etc/localtime && ln -s /usr/share/zoneinfo/Asia/Taipei /etc/localtime

ADD . /home/oauth

RUN chown oauth:oauth -R /home/oauth

USER oauth
WORKDIR /home/oauth

RUN npm install

RUN npm run build

EXPOSE 5555
EXPOSE 5556

CMD ["pm2-runtime", "start", "pm2.config.js"]
