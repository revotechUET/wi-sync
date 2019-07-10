let mysqlDump = require('mysqldump');
let mysqlImport = require('mysql-import');

async function exportToFile(config, databaseName) {
    await mysqlDump({
        connection: {
            host: config.host,
            user: config.user,
            password: config.password,
            database: databaseName
        },
        dumpToFile: './extracts/' + databaseName + '.sql'
    });
}

module.exports = {
    exportToFile: exportToFile
}

