const apiFunc = require('./src/router/mysql-sync/mysql.api');
let uploadCurve = require('./src/helper/upload-curve');
const divideArr = require('./src/helper/divideArr.helper');
const downloadCurves = require('./src/helper/download-curve-runner');
let getCurve = require('./src/helper/get-curve');


(async function() {
    let userName = process.argv.slice(2)[0];
    const config = require('config');

    let mySqlLocalConfig = {
        host: process.env.LOCAL_HOST || config.get("mysql.local.host"),
        port: process.env.LOCAL_PORT || config.get("mysql.local.port"),
        user: process.env.LOCAL_USER || config.get("mysql.local.user"),
        password: process.env.LOCAL_PASSWORD || config.get("mysql.local.password"),
        prefix: process.env.LOCAL_PREFIX || config.get("mysql.local.prefix")
    };

    let mySqlCloudConfig = {
        host: process.env.CLOUD_HOST || config.get("mysql.cloud.host"),
        port: process.env.CLOUD_PORT || config.get("mysql.cloud.port"),
        user: process.env.CLOUD_USER || config.get("mysql.cloud.user"),
        password: process.env.CLOUD_PASSWORD || config.get("mysql.cloud.password"),
        prefix: process.env.CLOUD_PREFIX || config.get("mysql.cloud.prefix")
    };

    try {
        let databaseName = mySqlLocalConfig.prefix + userName;
        console.log('Start sync database of user', userName);
        console.log("Start clone local database...");
        let localSqlFile = await apiFunc.exportToFile(mySqlLocalConfig, databaseName);
        console.log("Finish clone local database");
        console.log("Start clone cloud database...");
        let cloudSqlFile = await apiFunc.exportToFile(mySqlCloudConfig, databaseName);
        console.log("Finish clone cloud database");
        console.log("Start clean local database...");
        await apiFunc.cleanDatabase(mySqlLocalConfig, databaseName);
        console.log('Finish clean local database');
        console.log("Start merge local and base...");
        let mergedFile = await apiFunc.mergeFile(localSqlFile, cloudSqlFile);
        console.log('Finish merge');
        console.log("Start import new database to local");
        await apiFunc.importToDatabase(mySqlLocalConfig, databaseName, mergedFile);
        console.log('Finish sync');
        console.log('Cleaning temp file...');
        let fs = require('fs');
        fs.unlinkSync(mergedFile);
        console.log('Finish clean temp file');
        console.log('Start searching curve exist in database...');
        let curvePaths = await getCurve(config.get("mysql.local"), userName);
        console.log('Start download curve...');
        let smallerCurvePaths = divideArr(curvePaths, 100);
        downloadCurves(smallerCurvePaths);
    } catch (e) {
        console.log('Error in sync: ', e);
        console.log('Sync failed')
        console.log('Closed');
    }
})();