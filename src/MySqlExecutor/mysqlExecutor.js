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
        return new Promise(async (resolve,reject)=>{
            if (this.connection) {
                this.connection.time = Date.now();
                resolve(this.connection.mySqlConnection);
            } else {
                let tryToReconnection = async () => {
                    try {
                        this.connection = {};
                        this.connection.time = Date.now();
                        this.connection.mySqlConnection = await mysql2.createConnection(this.mySqlConfig);
                        resolve(this.connection.mySqlConnection);
                    } catch(e) {
                        setTimeout(tryToReconnection, 15*1000);
                    }
                };
                setTimeout(tryToReconnection, 0);
            }
        });
        // if (this.connection) {
        //     this.connection.time = Date.now();
        //     return this.connection.mySqlConnection;
        // } else {
        //     return
        //     this.connection = {};
        //     this.connection.time = Date.now();
        //     this.connection.mySqlConnection = await mysql2.createConnection(this.mySqlConfig);
        //     return this.connection.mySqlConnection;
        // }
    }

    async deleteConnection() {
        console.log('delete connection...');
        this.connection.mySqlConnection.end();
        this.connection = null;
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
        let retry = 0;
        let handleRun = async () => {
            let sqlData = this.queue.dequeue();
            if (sqlData !== null) {
                try {
                    await this.execute(sqlData);
                    await this.queue.deleteTail();
                    retry = 0;
                    setTimeout(handleRun, 0);
                } catch (e) {
                    if (e.message.toString() === "Can't add new command when connection is in closed state") {
                        await this.deleteConnection();
                    } else {
                        retry++;
                        if (retry > 3) {
                            await this.queue.deleteTail();
                            retry = 0;
                        }
                    }
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