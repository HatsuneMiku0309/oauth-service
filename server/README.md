# oauth-service

[TOC]

## Generate TLS cert
```shell=
$ openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -sha256 -days 365 // have password
$ openssl req -x509 -nodes -newkey rsa:4096 -keyout server.key -out server.crt -sha256 -days 365
```
You can also add -nodes (short for no DES) if you don't want to protect your private key with a passphrase. Otherwise it will prompt you for "at least a 4 character" password.

## Generate JWT RSA
> jwt Error: error:0909006C:PEM routines:get_name:no start line
```shell=
$ ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS512.key
$ openssl rsa -in jwtRS512.key -pubout -outform PEM -out jwtRS512.key.pub
```

## Release
```shell=
$ docker build -t oauth-s:1.0 .

$ docker run -d --name oauth-s -p 5555:5555 -p 5556:5556 oauth-s:1.0
```

### link
**database**

    database: mysql
    link: oauth-mysql-test:oauth-mysql
    port: default port
