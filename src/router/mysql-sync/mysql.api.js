let mysqlDump = require('mysqldump');
let mysqlImport = require('mysql-import');
let mysql2 = require('mysql2');
let exec = require('./../../helper/shellExec.helper');
let fs = require('fs');

async function exportToFile(config, databaseName, schemaOption) {
    let fileName = databaseName + Date.now().toString();
    let option = {
        connection: {
            host: config.host,
            user: config.user,
            password: config.password,
            database: databaseName,
            port: config.port
        },
        dumpToFile: './extracts/' + fileName + '.sql'
    };
    if (schemaOption === false) option.dump = {
        schema: false
    };
    await mysqlDump(option);
    return fileName + '.sql';
}

async function importToDatabase(config, databaseName, fileLink) {
    return mysqlImport.config({
        host: config.host,
        user: config.user,
        password: config.password,
        database: databaseName,
        port: config.port
    }).import(fileLink);
}

async function cleanDatabase(config, databaseName) {
    return new Promise(async (resolve, reject)=> {
        const connection = await mysql2.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            port: config.port
        });
        let statement = 'DROP DATABASE IF EXISTS ' + databaseName;
        connection.execute(statement , (err, res) => {
            if (err) {
                print(err);
                reject(err);
            } else {
                statement = 'CREATE DATABASE ' + databaseName;
                connection.execute(statement, (err, res)=>{
                    if (err) {
                        print(err);
                        reject(err);
                    } else {
                        connection.end();
                        console.log('DROP DATABASE');
                        resolve(null);
                    }
                });
            }
        });
    });
}


async function mergeFile(originalFile, updatedFile) {
    let originalLink = './extracts/' + originalFile;
    let updatedLink = './extracts/' + updatedFile;
    let patchLink = './extracts/' + 'patch' + Date.now().toString() + '.patch';
    // let code = await exec("diff -DVERSION1 " + originalLink + " " + updatedLink + " > " + patchLink);
    // if (code === 1) {
    //     // await exec("patch " + originalLink + " < " + patchLink);
    //     await exec("grep -v '^#if' " + patchLink + " | grep -v '^#endif' > " + originalLink);
    // }
    //remove
    //fs.unlinkSync(updatedLink);
    //fs.unlinkSync(patchLink);
    // return originalLink;
    fs.unlinkSync(originalLink);
    return updatedLink;
}

module.exports = {
    exportToFile: exportToFile,
    importToDatabase: importToDatabase,
    cleanDatabase: cleanDatabase,
    mergeFile: mergeFile
};

