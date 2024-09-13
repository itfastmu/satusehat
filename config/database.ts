import mysql from 'mysql2';

const execute = async (sql:string,params:any[]=[]):Promise<any> => {
    const pool = mysql.createPool({
        host: Bun.env.HOST,
        user: Bun.env.USER_DB,
        password: Bun.env.PASSWORD,
        database: Bun.env.DATABASE,
        connectionLimit:10
    });
    // now get a Promise wrapped instance of that pool
    const promisePool = pool.promise();
    // query database using promises
    const [results, ] = await promisePool.query(sql,params);
    pool.end();
    return results
}

export default execute
