import axios, { AxiosRequestConfig } from 'axios';
// tslint:disable-next-line: whitespace
const PROTOCOL = (import.meta as any).env.VITE_PROTOCOL || 'http';
// tslint:disable-next-line: whitespace
const URL = (import.meta as any).env.VITE_BASE_URL || 'localhost';
// tslint:disable-next-line: whitespace
const PORT = (import.meta as any).env.VITE_PORT || '8080';

export async function get<T = any>(
    api: string, params?: { [key: string]: any }, options: AxiosRequestConfig = { },
): Promise<T> {
    const { headers = { } } = options;
    try {
        const instance = axios.create({
            baseURL: `${PROTOCOL}://${URL}:${PORT}/api`,
            timeout: 1000,
            ...options,
            headers: Object.assign({
                'X-Custom-Header': 'Oauth',
                'Authorization': localStorage.getItem('token'),
            }, headers),
        });

        const res: T = await instance.get(api, {
            params,
        });

        return res;
    } catch (err) {
        throw err;
    }
}

export async function post<T = any>(
    api: string, data?: { [key: string]: any }, options: AxiosRequestConfig = { },
): Promise<T> {
    const { headers = { } } = options;
    try {
        const instance = axios.create({
            baseURL: `${PROTOCOL}://${URL}:${PORT}/api`,
            timeout: 1000,
            ...options,
            headers: Object.assign({
                'X-Custom-Header': 'Oauth',
                'Authorization': localStorage.getItem('token'),
            }, headers),
        });
        const res: T = await instance.post(api, data);

        return res;
    } catch (err) {
        throw err;
    }
}

export async function put<T = any>(
    api: string, data?: { [key: string]: any }, options: AxiosRequestConfig = { },
): Promise<T> {
    const { headers = { } } = options;
    try {
        const instance = axios.create({
            baseURL: `${PROTOCOL}://${URL}:${PORT}/api`,
            timeout: 1000,
            ...options,
            headers: Object.assign({
                'X-Custom-Header': 'Oauth',
                'Authorization': localStorage.getItem('token'),
            }, headers),
        });
        const res: T = await instance.put(api, data);

        return res;
    } catch (err) {
        throw err;
    }
}


export async function remove<T = any>(
    api: string, data?: { [key: string]: any }, options: AxiosRequestConfig = { },
): Promise<T> {
    const { headers = { } } = options;
    try {
        const instance = axios.create({
            baseURL: `${PROTOCOL}://${URL}:${PORT}/api`,
            timeout: 1000,
            ...options,
            headers: Object.assign({
                'X-Custom-Header': 'Oauth',
                'Authorization': localStorage.getItem('token'),
            }, headers),
        });
        const res: T = await instance.delete(api, data);

        return res;
    } catch (err) {
        throw err;
    }
}
