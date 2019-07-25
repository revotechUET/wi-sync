const mysql2 = require('mysql2/promise');

class MySqlExecutor {
    constructor(mySqlConfig, mongoQueue) {
        this.connection = null;
        this.mySqlConfig = mySqlConfig;
        this.queue = mongoQueue;
        //run cleaner
        setInterval(()=>{
            if (this.connection) {
                if ((Date.now() - this.connection.time) > 5 * 60 * 1000) {
                    this.connection.mySqlConnection.end();
                    this.connection = null;
                }
            }
        }, 5*60*1000);
    }

    async getConnection() {
        if (this.connection) {
            this.connection.time = Date.now();
            return this.connection.mySqlConnection;
        } else {
            this.connection = {};
            this.connection.time = Date.now();
            this.connection.mySqlConnection = await mysql2.createConnection(this.mySqlConfig);
            return this.connection.mySqlConnection;
        }
    }

    execute(sql) {
        return new Promise(async (resolve, reject) => {
            try {
                let connection = await this.getConnection();
                await connection.execute(sql);
                resolve(null);
            } catch (e) {
                reject(e);
            }
        });
    }

    run() {
        let tryErr = 0;
        let handleRun = async () => {
            let sqlData = this.queue.dequeue();
            if (sqlData !== null) {
                try {
                    await this.execute(sqlData);
                    await this.queue.deleteTail();
                    setTimeout(handleRun, 0);
                } catch (e) {
                    setTimeout(handleRun, 200);
                }
            } else {
                setTimeout(handleRun, 100);
            }
        };
        setTimeout(handleRun, 0);
    }
}


module.exports = MySqlExecutor;