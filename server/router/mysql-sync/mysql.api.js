let mysqlDump = require('mysqldump');
let mysqlImport = require('mysql-import');
let mysql2 = require('mysql2');

async function exportToFile(config, databaseName) {
    let fileName = databaseName + Date.now().toString();
    await mysqlDump({
        connection: {
            host: config.host,
            user: config.user,
            password: config.password,
            database: databaseName
        },
        dumpToFile: './extracts/' + fileName + '.sql'
    });
    return fileName + '.sql';
}

async function importToDatabase(config, databaseName, fileLink) {
    return mysqlImport.config({
        host: config.host,
        user: config.user,
        password: config.password,
        databaseName: databaseName
    }).import(fileLink);
}

async function dropDatabase(config, databaseName) {
    return new Promise(async (resolve, reject)=> {
        const connection = await mysql2.createConnection({
            host: config.host,
            user: config.user,
            password: config.password
        });
        let statement = 'DROP DATABASE IF EXISTS ' + databaseName;
        connection.execute(statement , (err, res) => {
            if (err) {
                print(err);
                reject((err));
            } else {
                connection.end();
                resolve(null);
            }
        });
    });
}

async function mergeFile(orignalFileLink, updatedFileLink) {

}

module.exports = {
    exportToFile: exportToFile,
    importToDatabase: importToDatabase,
    dropDatabase: dropDatabase
}

