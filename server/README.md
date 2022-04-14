# oauth-service

[TOC]

## Generate TLS cert
```shell=
$ openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365
```
You can also add -nodes (short for no DES) if you don't want to protect your private key with a passphrase. Otherwise it will prompt you for "at least a 4 character" password.

## Generate JWT RSA
> jwt Error: error:0909006C:PEM routines:get_name:no start line
```shell=
$ ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS512.key
$ openssl rsa -in jwtRS512.key -pubout -outform PEM -out jwtRS512.key.pub
```