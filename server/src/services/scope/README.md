SCOPE API
===

[TOC]

## Register System Permission
If you have new system or restart system, should register api-scope.

api: `/api-scope/register/:system`
method: `POST`
headers:
```json=
{
    Authorization: Basic {{Authorization-basic}}
}
```
body: 
```json=
[{
    name: {api-scope-name},
    description?: {description},
    apis: {
        api: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        params?: any;
    },
    is_required?: boolean
}, ...]
```

`is_required` parameter is your system required api-scope. `ex. user_profile`.
When you create `oauth_app` and setting api-scope, default register required api-scope same `system`  as your select api-scope in `oauth-app`.

> Authorization-basic is `client_id:client_secret` base64 encoding