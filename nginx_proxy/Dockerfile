FROM nginx:latest

MAINTAINER cosmo

RUN apt-get update &&\
    apt-get install -y vim &&\
    mkdir /etc/nginx/ssl && mkdir /opt/nginx &&\
    unlink /etc/localtime && ln -s /usr/share/zoneinfo/Asia/Taipei /etc/localtime

ADD ./404.html /opt/nginx/
ADD ./ssl/ /etc/nginx/ssl
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]