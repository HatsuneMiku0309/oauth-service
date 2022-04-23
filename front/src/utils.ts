export function encodeBase64(str: string) {
    try {
        return window.btoa(str);
    } catch (err) {
        throw new Error('encode base64 fail');
    }
}

export function decodeBase64(str: string) {
    try {
        return window.atob(str);
    } catch (err) {
        throw new Error('decode base64 fail');
    }
}
