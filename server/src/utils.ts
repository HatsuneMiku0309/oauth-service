/**
 * regular http://www.rexegg.com/regex-disambiguation.html#negative-lookbehind
 * regular中文 https://www.fooish.com/regex-regular-expression/groups-lookaround.html
 */

import { install } from 'source-map-support';
install();

import * as dayjs from 'dayjs';

function checkDate (date: string): boolean {
    try {
        const re = /^[0-9]{4}[-\/][0-9]{2}[-\/][0-9]{2}$/;
        if (re.test(date) && dayjs(date).isValid() && (new Date(date)).toString() !== 'Invalid Date') {
            return true;
        }

        return false;
    } catch (err) {
        throw err;
    }
}

function checkDateTime (datetime: string): boolean {
    try {
        const re = /^[0-9]{4}[-\/][0-9]{2}[-\/][0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/;
        if (re.test(datetime) && dayjs(datetime).isValid() && (new Date(datetime)).toString() !== 'Invalid Date') {
            return true;
        }

        return false;
    } catch (err) {
        throw err;
    }
}

function checkHttpProtocol (url: string, https: boolean = false) {
    try {
        const re = https === true
            ? /^https:\/\/.+/
            : /^https?:\/\/.+/;
        if (re.test(url)) {
            return true;
        }

        return false;
    } catch (err) {
        throw err;
    }
}

function checkRedirectUri (uri: string) {
    try {
        const re = /^https?:\/\/[a-zA-Z\d\-\.]+(?<![\.])(:?[\d]{1,5})?(\/[\w]+)+$/;
        if (re.test(uri)) {
            return true;
        }

        return false;
    } catch (err) {
        throw err;
    }
}

export {
    checkDate,
    checkDateTime,
    checkHttpProtocol,
    checkRedirectUri
};
