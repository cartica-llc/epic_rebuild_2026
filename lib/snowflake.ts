//@/lib/snowflake.ts

import snowflake from 'snowflake-sdk';

let connectionPromise: Promise<snowflake.Connection> | null = null;

// Private key can be stored in the env var either with real newlines
// or with literal "\n" (common when pasting into a single-line env value).
function loadPrivateKey(): string {
    const raw = process.env.DEV_SNOWFLAKE_PRIVATE_KEY!;
    const pem = raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
    const passphrase = process.env.DEV_SNOWFLAKE_PRIVATE_KEY_PASSPHRASE;

    if (!passphrase) {
        // Unencrypted key, use as-is.
        return pem;
    }

    // Encrypted key: decrypt once at load time and re-export as plain PKCS8 PEM,
    // since snowflake-sdk's `privateKey` option expects an unencrypted key.
    const crypto = require('crypto');
    const keyObject = crypto.createPrivateKey({
        key: pem,
        format: 'pem',
        passphrase,
    });
    return keyObject.export({ format: 'pem', type: 'pkcs8' }) as string;
}

function getConnection(): Promise<snowflake.Connection> {
    if (!connectionPromise) {
        connectionPromise = new Promise((resolve, reject) => {
            const conn = snowflake.createConnection({
                account: process.env.DEV_SNOWFLAKE_ACCOUNT!,
                username: process.env.DEV_SNOWFLAKE_USER!,
                authenticator: 'SNOWFLAKE_JWT',
                privateKey: loadPrivateKey(),
                database: process.env.DEV_SNOWFLAKE_DATABASE!,
                schema: process.env.DEV_SNOWFLAKE_SCHEMA!,
                warehouse: process.env.DEV_SNOWFLAKE_WAREHOUSE!,
                role: process.env.DEV_SNOWFLAKE_ROLE!,
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