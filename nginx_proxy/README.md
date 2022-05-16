Release
===
[TOC]

## Front-end
```shell=
$ docker build -t oauth-f:1.0 .

$ docker run -d --name oauth-f -p 8888:80 -p 7777:443 oauth-f:1.0
$ docker run -d --name oauth-f oauth-f:1.0
$ docker run -d --restart=always --name oauth-f oauth-f:1.0
```

## back-end
```shell=
$ docker build -t oauth-s:1.0 .

$ docker run -d --name oauth-s -p 5555:5555 -p 5556:5556 --link oauth-mysql-test:oauth-mysql oauth-s:1.0
$ docker run -d --name oauth-s --link oauth-mysql-test:oauth-mysql oauth-s:1.0
$ docker run -d --restart=always --name oauth-s --link oauth-mysql-test:oauth-mysql oauth-s:1.0
```

### link
**database**

    database: mysql
    link: oauth-mysql-test:oauth-mysql
    port: default port

## proxy
```shell=
$ docker build -t oauth-n:1.0 .

$ docker run -d --name oauth-n --link oauth-f:server_font --link oauth-s:server -p 80:80 -p 443:443 oauth-n:1.0
$ docker run -d --restart=always --name oauth-n --link oauth-f:server_font --link oauth-s:server -p 80:80 -p 443:443 oauth-n:1.0
```

### link

### back-end
**front-end**

    location: /
    link: oauth-f:server_font
    port: 80<http>/443<https>

**back-end**

    location: /api
    link: oauth-s:server
    port: 5555<http>/5556<https>

### other
`http` redirect `https`

## try it

1. proxy_pass can use `https://...`
    > nginx response 502 fail