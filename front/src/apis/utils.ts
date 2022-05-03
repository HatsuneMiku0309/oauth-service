import axios, { AxiosRequestConfig } from 'axios';
// tslint:disable-next-line: whitespace
const PROTOCOL = (import.meta as any).env.VITE_PROTOCOL || 'http';
// tslint:disable-next-line: whitespace
const URL = (import.meta as any).env.VITE_BASE_URL || 'localhost';
// tslint:disable-next-line: whitespace
const PORT = (import.meta as any).env.VITE_PORT || '8080';
// tslint:disable-next-line: whitespace
const TIMEOUT = Number((import.meta as any).env.VITE_TIMEOUT) || 1000;

function errorHandle(err: any) {
    if (!!err.response) {
        if ([401, 403].includes(err.response.status)) {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('user-data');
            const search = window.location.search;
            window.location.href = '/login' + search;
            throw err;
        } else if ([301, 302].includes(err.response.status)) {
            window.location.href = err.response.location;
        } else {
            throw err;
        }
    } else {
        err.response = { data: { errMsg: err.message } };
        throw err;
    }
}

const PARAMS = {
    baseURL: `${PROTOCOL}://${URL}:${PORT}/api`,
    timeout: TIMEOUT,
    headers: {
        'X-Custom-Header': 'Oauth',
        'content-type': 'application/json',
        // 'X-Requested-With': 'XMLHttpRequest',
    },
};
const instance = axios.create(PARAMS);
instance.interceptors.response.use((res) => {
    return res;
}, errorHandle);

function cookieGet(name: string) {
    // tslint:disable-next-line: prefer-const
    let arr;
    const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
    // tslint:disable-next-line: no-conditional-assignment
    if (arr = document.cookie.match(reg)) {
        return (arr[2]);
    } else {
        return null;
    }
}

// function cookieSet(cname: string, value: any, expiredays: number) {
//     const exdate = new Date();
//     exdate.setDate(exdate.getDate() + expiredays);
//     document.cookie = cname + '=' + escape(value) + ((expiredays == null) ? '' : ';expires=' + exdate.toUTCString());
// }

export async function get<T = any>(
    api: string, params?: { [key: string]: any }, options: AxiosRequestConfig = { },
): Promise<T> {
    const { headers = { } } = options;
    try {
        const res: T = await instance.get(api, {
            params,
            headers: Object.assign(PARAMS.headers, { Authorization: localStorage.getItem('token') }),
        });

        return res;
    } catch (err: any) {
        throw err;
    }
}

export async function post<T = any>(
    api: string, data?: { [key: string]: any }, options: AxiosRequestConfig = { },
): Promise<T> {
    const { headers = { } } = options;
    try {
        const res: T = await instance.post(api, data, {
            headers: Object.assign(PARAMS.headers, { Authorization: localStorage.getItem('token') }),
        });

        return res;
    } catch (err: any) {
        throw err;
    }
}

/**
 * post implements redirect(302), use fetch
 * @param api
 * @param data
 * @param options
 * @returns
 */
export async function postFetch<T = any>(
    api: RequestInfo, data?: { [key: string]: any }, options: RequestInit = { },
): Promise<{
    res: Response;
    data: T;
    headers: { [key: string]: any };
}> {
    // tslint:disable-next-line: variable-name
    const { baseURL, timeout, headers: _headers } = PARAMS;
    const { headers = { } } = options;
    try {
        const controller = new AbortController();
        setTimeout(() => {
            controller.abort();
        }, timeout);
        const p = {
            body: JSON.stringify(data),
            method: 'POST',
            ...options,
            headers: Object.assign(_headers, headers),
            signal: controller.signal,
        };
        const res = await fetch(`${baseURL}${api}`, {
            ...p, credentials: 'include',
        });
        if (res.type === 'opaqueredirect') {
            const location = cookieGet('location');
            if (location) {
                window.location.href = location;
            }

            return {
                res,
                data: {} as T,
                headers: {},
            };
        } else {
            const resData = await res.json();
            const resHeaders: { [key: string]: any } = { };
            res.headers.forEach((value, key) => {
                resHeaders[key] = value;
            });
            if (res.ok === true) {
                return {
                    res,
                    data: resData,
                    headers: resHeaders,
                };
            }

            const resErr = {
                res,
                response: {
                    data: resData,
                    status: res.status,
                    statusText: res.statusText,
                },
            };
            let err = new Error();
            err = { ...err, ...resErr };

            throw err;
        }
    } catch (err: any) {
        if (err.name === 'AbortError') {
            err.response = {
                status: null,
                statusText: 'canceled',
                data: {
                    errMsg: err.message,
                },
            };
        }
        throw err;
    }
}

export async function put<T = any>(
    api: string, data?: { [key: string]: any }, options: AxiosRequestConfig = { },
): Promise<T> {
    const { headers = { } } = options;
    try {
        const res: T = await instance.put(api, data, {
            headers: Object.assign(PARAMS.headers, { Authorization: localStorage.getItem('token') }),
        });

        return res;
    } catch (err) {
        throw err;
    }
}


export async function del<T = any>(
    api: string, data?: { [key: string]: any }, options: AxiosRequestConfig = { },
): Promise<T> {
    const { headers = { } } = options;
    try {
        const res: T = await instance.delete(api, {
            data,
            headers: Object.assign(PARAMS.headers, { Authorization: localStorage.getItem('token') }),
        });

        return res;
    } catch (err) {
        throw err;
    }
}
