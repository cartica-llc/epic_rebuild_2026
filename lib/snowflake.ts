//@/lib/snowflake.ts


import snowflake from 'snowflake-sdk';

let connectionPromise: Promise<snowflake.Connection> | null = null;

function getConnection(): Promise<snowflake.Connection> {
    if (!connectionPromise) {
        connectionPromise = new Promise((resolve, reject) => {
            const conn = snowflake.createConnection({
                account: process.env.SNOWFLAKE_ACCOUNT!,
                username: process.env.SNOWFLAKE_USER!,
                password: process.env.SNOWFLAKE_PASSWORD!,
                database: process.env.SNOWFLAKE_DATABASE!,
                schema: process.env.SNOWFLAKE_SCHEMA!,
                warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
                role: process.env.SNOWFLAKE_ROLE!,
            });
            conn.connect((err) => {
                if (err) {
                    connectionPromise = null;
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });
    }
    return connectionPromise;
}

export function query(sql: string): Promise<unknown[]> {
    return getConnection().then(
        (conn) =>
            new Promise((resolve, reject) => {
                conn.execute({
                    sqlText: sql,
                    complete: (err, _stmt, rows) =>
                        err ? reject(err) : resolve(rows ?? []),
                });
            })
    );
}