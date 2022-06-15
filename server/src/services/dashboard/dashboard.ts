import { install } from 'source-map-support';
install();

import { FieldPacket } from 'mysql2';
import { Connection } from 'mysql2/promise';
import { TAnyObj, IMysqlDatabase, IConfig } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import { IDashboard, IGetApplicationUsersRes, IGetUserdRateQuery, IGetUserdRateRes, IOauthTokenUsedRateDao } from './dashboard.interface';
import * as dayjs from 'dayjs';
import * as _ from 'lodash';

enum DATE_CONVERT {
    'min' = 'm',
    'hour' = 'h',
    '6hour' = 'h',
    '12hour' = 'h',
    'day' = 'd'
}

class Dashboard implements IDashboard {
    static instance: IDashboard;
    options: TAnyObj & { config: IConfig };
    private constructor(options: TAnyObj & { config: IConfig }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj & { config: IConfig }): IDashboard {
        if (!Dashboard.instance) {
            Dashboard.instance = new Dashboard(options);
        }

        return Dashboard.instance;
    }

    async getUsedRate(database: IMysqlDatabase, query: IGetUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetUserdRateRes> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbGetUsedRate(db, query, options);

                return result;
            } catch (err) {
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err) {
            throw err;
        }
    }

    async dbGetUsedRate(db: Connection, query: IGetUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetUserdRateRes> {
        const { DATE_TYPE } = query;
        try {
            let nowDate = new Date();
            if (!DATE_TYPE) {
                throw new Error('[DATE_TYPE] Is required');
            }
            if (!['min', 'hour', '6hour', '12hour', 'day'].includes(DATE_TYPE)) {
                throw new Error('[DATE_TYPE] Type error');
            }

            let sql = 'SELECT * FROM OAUTH_TOKEN_USED_RATE WHERE CREATE_TIME >= ?';
            let dateP = DATE_CONVERT[DATE_TYPE];
            let dateParam = DATE_TYPE === '6hour'
                ? 6
                : DATE_TYPE === '12hour'
                ? 12
                : 1;
            let params = [dayjs(nowDate).subtract(dateParam, dateP).format('YYYY-MM-DD HH:mm:00')];
            let [rows] = <[IOauthTokenUsedRateDao[], FieldPacket[]]> await db.query(sql, params);

            let result = _.reduce(rows, (_r, row) => {
                _r.USED_COUNT += 1;

                return _r;
            }, {
                DATE_TIME: new Date(dayjs(nowDate).subtract(dateParam, dateP).format('YYYY-MM-DD HH:mm:00')),
                USED_COUNT: 0
            });

            return result;
        } catch (err) {
            throw err;
        }
    }

    async getApplicationUsers(database: IMysqlDatabase, options: TAnyObj & IJWTCotext): Promise<IGetApplicationUsersRes[]> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbGetApplicationUsers(db, options);

                return result;
            } catch (err) {
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err) {
            throw err;
        }
    }

    async dbGetApplicationUsers(db: Connection, options: TAnyObj & IJWTCotext): Promise<IGetApplicationUsersRes[]> {
        try {
            return [];
        } catch (err) {
            throw err;
        }
    }
}

export {
    Dashboard
};
