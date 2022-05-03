FROM nginx:latest

MAINTAINER cosmo

RUN apt-get update &&\
    apt-get install -y vim ssh git &&\
    mkdir /opt/oauth && mkdir /etc/nginx/ssl &&\
    unlink /etc/localtime && ln -s /usr/share/zoneinfo/Asia/Taipei /etc/localtime

ADD ./dist /opt/oauth
ADD ./nginx_config/ssl/ /etc/nginx/ssl
COPY ./nginx_config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
EXPOSE 443

# this docker container please expose, should link other nginx and same-orgin back-end

CMD ["nginx", "-g", "daemon off;"]