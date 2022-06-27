import { install } from 'source-map-support';
install();

import { FieldPacket } from 'mysql2';
import { Connection } from 'mysql2/promise';
import { TAnyObj, IMysqlDatabase, IConfig } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import {
    IDashboard, IGetApplicationUsersRes, IGetUserdRateQuery,
    IGetUsedRateRes, IOauthTokenUsedRateDao, IGetApplicationUsedRateRes,
    IApplicationUsedRate, IGetApplicationUserdRateQuery
} from './dashboard.interface';
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

    private async _removeExpiredDatas(db: Connection, options: TAnyObj & IJWTCotext): Promise<any> {
        try {
            let sql = `
                DELETE FROM OAUTH_TOKEN_USED_RATE WHERE CREATE_TIME <= DATE_SUB(CURRENT_DATE() , INTERVAL 10 DAY)
            `;
            let result = await db.query(sql);

            return result;
        } catch (err) {
            throw err;
        }
    }

    async getUsedRate(database: IMysqlDatabase, query: IGetUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetUsedRateRes[]> {
        try {
            let db = await database.getConnection();
            try {
                await this._removeExpiredDatas(db, options);
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

    private _loopDate<T extends (IGetUsedRateRes & { OAUTH_APPLICATION_NAME: string }) | IGetUsedRateRes>(
        query: IGetUserdRateQuery,
        datas: T[],
        options: TAnyObj & IJWTCotext
    ): (IGetUsedRateRes | IGetApplicationUsedRateRes)[] {
        const { date_type, count = 12 } = query;
        const { nowDate } = options;
        try {
            let result: T[] = [];
            let dateParam = date_type === '6hour'
                ? 6
                : date_type === '12hour'
                ? 12
                : 1;
            let dateP = DATE_CONVERT[date_type];
            let hour = Number(Math.floor(nowDate.getHours() / dateParam));
            let dateFormat = date_type === 'min'
                ? 'YYYY-MM-DD HH:mm:00'
                : date_type.indexOf('hour') !== -1
                ? 'YYYY-MM-DD HH:00:00'
                : 'YYYY-MM-DD 00:00:00';
            let startDate = dayjs(nowDate).subtract(dateParam * count, dateP).format(dateFormat);
            dateFormat = date_type === 'min'
                ? 'YYYY-MM-DD HH:mm:00'
                : date_type.indexOf('hour') !== -1
                ? `YYYY-MM-DD ${hour * dateParam}:00:00`
                : 'YYYY-MM-DD 00:00:00';
            for (let i = 1 ; i <= count ; i++) {
                let _startDate: string;
                if (date_type.indexOf('hour') !== -1) {
                    let _hour = Number(Math.floor(dayjs(startDate).add(dateParam * i, dateP).toDate().getHours() / dateParam));
                    _startDate = dayjs(startDate).add(dateParam * i, dateP).format(`YYYY-MM-DD ${_hour * dateParam}:00:00`);
                } else {
                    _startDate = dayjs(startDate).add(dateParam * i, dateP).format(dateFormat);
                }
                let filterDatas = datas.filter((data) => {
                    return +data.DATE_TIME === +new Date(_startDate);
                });
                let usedCount = _.sum(_.map(filterDatas, (filterData) => Number(filterData.USED_COUNT)));
                let obj = <T> {
                    DATE_TIME: new Date(_startDate),
                    USED_COUNT: usedCount
                };
                if (filterDatas.length !== 0) {
                    'OAUTH_APPLICATION_NAME' in filterDatas[0] &&
                    ((<(IGetUsedRateRes & { APPLICATION: IApplicationUsedRate[] })> obj).APPLICATION = (<(IGetUsedRateRes & { OAUTH_APPLICATION_NAME: string })[]> filterDatas).map((filterData) => {
                        return {
                            NAME: filterData.OAUTH_APPLICATION_NAME,
                            USED_COUNT: filterData.USED_COUNT
                        };
                    }));
                }

                result.push(obj);
            }

            return result;
        } catch (err) {
            throw err;
        }
    }

    async dbGetUsedRate(db: Connection, query: IGetUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetUsedRateRes[]> {
        const { user: { user_id } } = options;
        const { date_type, count = 12 } = query;
        try {
            let nowDate = new Date();
            if (!date_type) {
                throw new Error('[date_type] Is required');
            }
            if (!['min', 'hour', '6hour', '12hour', 'day'].includes(date_type)) {
                throw new Error('[date_type] Type error');
            }
            if (count > 100) {
                throw new Error('[count] grant than 100');
            } else if (count <= 0) {
                throw new Error('[count] less equal than 0');
            }
            if (date_type === 'day' && count > 10) {
                throw new Error(`[${date_type}]-[${count}] ${date_type} max count is 10`);
            } else if (date_type === '12hour' && count > 20) {
                throw new Error(`[${date_type}]-[${count}] ${date_type} max count is 20`);
            } else if (date_type === '6hour' && count > 40) {
                throw new Error(`[${date_type}]-[${count}] ${date_type} max count is 40`);
            }

            let sql = `
            SELECT
                OTUR.CREATE_TIME
            FROM
                OAUTH_TOKEN_USED_RATE OTUR,
                OAUTH_APPLICATION OA
            WHERE
                OA.ID = OTUR.OAUTH_APPLICATION_ID
                AND OA.USER_ID = ?
                AND OTUR.CREATE_TIME >= ?
            ORDER BY
                OTUR.CREATE_TIME ASC
            `;
            let dateP = DATE_CONVERT[date_type];
            let dateParam = date_type === '6hour'
                ? 6
                : date_type === '12hour'
                ? 12
                : 1;
            let dateFormat = date_type === 'min'
                ? 'YYYY-MM-DD HH:mm:00'
                : date_type.indexOf('hour') !== -1
                ? 'YYYY-MM-DD HH:00:00'
                : 'YYYY-MM-DD 00:00:00';
            let params = [user_id, dayjs(nowDate).subtract(dateParam * count, dateP).format(dateFormat)];
            let [rows] = <[IOauthTokenUsedRateDao[], FieldPacket[]]> await db.query(sql, params);

            let groupRows = _.groupBy(rows, (row) => {
                let result = new Date(dayjs(row.CREATE_TIME).format(dateFormat));
                let date = new Date(<Date> row.CREATE_TIME);
                let hour = 0;
                if (date_type.indexOf('hour') !== -1) {
                    hour = Number(Math.floor(date.getHours() / dateParam));
                    result = new Date(dayjs(date).format(`YYYY-MM-DD ${hour * dateParam}:00:00`));
                }

                return result;
            });

            let result = _.reduce(groupRows, (_r, _rows, DATE_TIME) => {
                _r.push({
                    DATE_TIME: new Date(DATE_TIME),
                    USED_COUNT: _rows.length
                });

                return _r;
            }, <IGetUsedRateRes[]> []);
            result = this._loopDate(query, result, { ...options, nowDate });

            return result;
        } catch (err) {
            throw err;
        }
    }

    async getApplicationUesdRate(database: IMysqlDatabase, query: IGetApplicationUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetApplicationUsedRateRes[]> {
        try {
            let db = await database.getConnection();
            try {
                await this._removeExpiredDatas(db, options);
                let result = await this.dbGetApplicationUesdRate(db, query, options);

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

    async dbGetApplicationUesdRate(db: Connection, query: IGetApplicationUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetApplicationUsedRateRes[]> {
        const { user: { user_id } } = options;
        const { date_type } = query;
        const count = 1;
        try {
            let nowDate = new Date();
            if (!date_type) {
                throw new Error('[date_type] Is required');
            }
            if (!['min', 'hour', '6hour', '12hour', 'day'].includes(date_type)) {
                throw new Error('[date_type] Type error');
            }
            if (count > 100) {
                throw new Error('[count] grant than 100');
            } else if (count <= 0) {
                throw new Error('[count] less equal than 0');
            }

            let sql = `
            SELECT
                OA.NAME OAUTH_APPLICATION_NAME,
                OTUR.CREATE_TIME
            FROM
                OAUTH_TOKEN_USED_RATE OTUR,
                OAUTH_APPLICATION OA
            WHERE
                OA.ID = OTUR.OAUTH_APPLICATION_ID
                AND OA.USER_ID = ?
                AND OTUR.CREATE_TIME >= ?
            ORDER BY
                OTUR.CREATE_TIME ASC
            `;
            let dateP = DATE_CONVERT[date_type];
            let dateParam = date_type === '6hour'
                ? 6
                : date_type === '12hour'
                ? 12
                : 1;
            let dateFormat = date_type === 'min'
                ? 'YYYY-MM-DD HH:mm:00'
                : date_type.indexOf('hour') !== -1
                ? 'YYYY-MM-DD HH:00:00'
                : 'YYYY-MM-DD 00:00:00';
            let params = [user_id, dayjs(nowDate).subtract(dateParam * count, dateP).format(dateFormat)];
            let [rows] = <[(IOauthTokenUsedRateDao & { OAUTH_APPLICATION_NAME: string })[], FieldPacket[]]> await db.query(sql, params);

            let groupRows = _.groupBy(rows, (row) => {
                let result = new Date(dayjs(row.CREATE_TIME).format(dateFormat));
                let date = new Date(<Date> row.CREATE_TIME);
                let hour = 0;
                if (date_type.indexOf('hour') !== -1) {
                    hour = Number(Math.floor(date.getHours() / dateParam));
                    result = new Date(dayjs(date).format(`YYYY-MM-DD ${hour * dateParam}:00:00`));
                }

                return `${row.OAUTH_APPLICATION_NAME};;${result}`;
            });

            let datas = _.reduce(groupRows, (_r, _rows, keys) => {
                const [NAME, DATE_TIME] = keys.split(';;');
                _r.push({
                    OAUTH_APPLICATION_NAME: NAME,
                    DATE_TIME: new Date(DATE_TIME),
                    USED_COUNT: _rows.length
                });

                return _r;
            }, <(IGetUsedRateRes & { OAUTH_APPLICATION_NAME: string })[]> []);
            let appDatas = <IGetApplicationUsedRateRes[]> this._loopDate({ ...query, count }, datas, { ...options, nowDate });
            // let groupByDatas = _.groupBy(datas, 'DATE_TIME');
            let result = _.map(appDatas, (data) => {

                return {
                    DATE_TIME: data.DATE_TIME,
                    USED_COUNT: data.USED_COUNT,
                    APPLICATION: _.map(data.APPLICATION, (app) => {
                        return {
                            NAME: app.NAME,
                            USED_COUNT: app.USED_COUNT
                        };
                    })
                };
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
