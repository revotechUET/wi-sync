// const express = require('express');
//
// const app = express();
// const bodyParser = require('body-parser');
//
// const apiFunc = require('./src/router/mysql-sync/mysql.api');
//
// const exec = require('./src/helper/shellExec.helper');

// const port = process.env.PORT || 3035;
//
// const mysqlApi = require('./src/router/mysql-sync/mysql.route');
//
// app.use(bodyParser.urlencoded({ extended: false }));
//
// app.use(bodyParser.json());
//
// app.use('/mysql', mysqlApi);
//
// app.listen(port, () => {
//     console.log('App listening in port ', port);
// });

// (async function() {
//     let userName = process.argv.slice(2)[0];
//     const config = require('config');
//
//     let mySqlLocalConfig = {
//         host: process.env.LOCAL_HOST || config.get("mysql.local.host"),
//         port: process.env.LOCAL_PORT || config.get("mysql.local.port"),
//         user: process.env.LOCAL_USER || config.get("mysql.local.user"),
//         password: process.env.LOCAL_PASSWORD || config.get("mysql.local.password"),
//         prefix: process.env.LOCAL_PREFIX || config.get("mysql.local.prefix")
//     };
//
//     let mySqlCloudConfig = {
//         host: process.env.CLOUD_HOST || config.get("mysql.cloud.host"),
//         port: process.env.CLOUD_PORT || config.get("mysql.cloud.port"),
//         user: process.env.CLOUD_USER || config.get("mysql.cloud.user"),
//         password: process.env.CLOUD_PASSWORD || config.get("mysql.cloud.password"),
//         prefix: process.env.CLOUD_PREFIX || config.get("mysql.cloud.prefix")
//     };
//
//     try {
//         let databaseName = mySqlLocalConfig.prefix + userName;
//         console.log('Start sync database of user', userName);
//         console.log("Start clone local database...");
//         let localSqlFile = await apiFunc.exportToFile(mySqlLocalConfig, databaseName);
//         console.log("Finish clone local database");
//         console.log("Start clone cloud database...");
//         let cloudSqlFile = await apiFunc.exportToFile(mySqlCloudConfig, databaseName);
//         console.log("Finish clone cloud database");
//         console.log("Start clean local database...");
//         await apiFunc.cleanDatabase(mySqlLocalConfig, databaseName);
//         console.log('Finish clean local database');
//         console.log("Start merge local and base...");
//         let mergedFile = await apiFunc.mergeFile(localSqlFile, cloudSqlFile);
//         console.log('Finish merge');
//         console.log("Start import new database to local");
//         await apiFunc.importToDatabase(mySqlLocalConfig, databaseName, mergedFile);
//         console.log('Finish sync');
//         console.log('Cleaning temp file...');
//         let fs = require('fs');
//         fs.unlinkSync(mergedFile);
//         console.log('Finish clean temp file');
//     } catch (e) {
//         console.log('Error in sync: ', e);
//         console.log('Sync failed')
//         console.log('Closed');
//     }
// })();

// function updateToCloud(connection, payload) {
//     return new Promise((rel, rej)=>{
//         connection.execute(payload, (err, res)=>{
//             if (err) {
//                 rej(err);
//             } else {
//                 rel(0);
//             }
//         });
//     });
// }

// function run(store, connections) {
//     return new Promise((resolve,reject)=>{
//         // // let interval = setInterval(()=>{
//         // //   if (!store.state) {
//         // //     clearInterval(interval);
//         // //     resolve(true);
//         // //   }
//         // //   else if (store.queue.length > 0) {
//         // //     let data = store.queue.pop();
//         // //     client.publish(pushChanel,JSON.stringify(data),{qos:2},(err)=>{
//         // //       if (err) store.queue.push(data);
//         // //     });
//         // //   }
//         // },200);
//         let handleRun = function() {
//             if (store.length > 0) {
//                 let stmt = store.shift();
//                 connections.execute(stmt, (err, res)=>{
//                     if(err) {
//                         console.log(err);
//                     }
//                 });
//             }
//             setTimeout(handleRun,10);
//         }
//         setTimeout(handleRun,10);
//     });
// }

// (async function () {
//     let mqtt = require('mqtt');
//
//     let queue = [];
//     let queueCloud = [];
//
//     let mysql2 = require('mysql2');
//     let config = require('config').get("mysql.cloud");
//
//     const connections = await mysql2.createPool({
//         host: config.host,
//         user: config.user,
//         password: config.password,
//         port: config.port,
//         database: 'wi1004_phuc',
//         connectionLimit: 15,
//         queueLimit: 30
//     });
//
//
//     let client = mqtt.connect('mqtt://localhost:1883', {clientId: "LOCAL_CLIENT" + new Date().toString(), clean: false});
//     let clientCloud = mqtt.connect('wss://mqtt-broker.i2g.cloud', {clientId: "LOCAL_CLIENT_TEST", clean: false, rejectUnauthorized: false}, (err)=>{
//         console.log(err);
//     });
//
//
//     client.subscribe('sync/#', {qos: 2});
//     clientCloud.subscribe('sync/#', {qos: 2});
//
//     clientCloud.on('connect', ()=>{
//         console.log('cloud connected');
//     });
//
//     client.on('message', (topic, payload) => {
//         let index = topic.indexOf('/');
//         topic = topic.slice(index+1);
//         // console.log(topic+':', payload.toString());
//         queue.push(payload.toString());
//     });
//
//     clientCloud.on('message', (topic, payload) => {
//         let index = topic.indexOf('/');
//         topic = topic.slice(index+1);
//         console.log(topic+':', payload.toString());
//         queueCloud.push(payload.toString());
//     });
//
//     client.on('connect', ()=>{
//        console.log('mqtt connected');
//     });
//
//     run(queue, connections);
//
//     // if (connection == null) return;
//
// })();

// let client = require('mqtt').connect('mqtt://localhost:1883', {clientId: "LOCAL_CLIENT" + new Date().toString(), clean: false});
//
// client.subscribe('sync/#');
// client.on('message', (topic, payload)=>{
//     topic = topic.slice(5);
//     console.log(topic + ':', payload.toString());
// });

(async function() {
    let mongoUrl = "mongodb://";

    let config = require("config");

    mongoUrl = mongoUrl + config.get("mongo.host") + ":" + config.get("mongo.port") + "/" + config.get("mongo.queueDataBase");

    const mongoose = require('mongoose');
    const NodeSchema = require('./src/MongoQueue/mongo.model');
    //connect mongo
    try {
        await mongoose.connect(mongoUrl, {useNewUrlParser: true});

    } catch (err) {
        console.log('Mongo database out of reach');
        return;
    }

    let nodeLocal = mongoose.model('NodeLocal', NodeSchema);
    let nodeCloud = mongoose.model('NodeCloud', NodeSchema);
    let MongoQueue = require("./src/MongoQueue/mongo.queue");

    let localQueue = new MongoQueue(nodeLocal);
    let cloudQueue = new MongoQueue(nodeCloud);
    //load queue from database
    try {
        await localQueue.initLoad();
        await cloudQueue.initLoad();
    } catch(err) {
        console.log(err);
        return;
    }

    console.log('Mongo queue init successfully');

    let OrderingQueue = require('./src/helper/OrderingQueue.helper');
    //let orderingQueueLocal = new OrderingQueue(localQueue);
    let orderingQueueCloud = new OrderingQueue(cloudQueue);
    //orderingQueueLocal.run();
    orderingQueueCloud.run();


    let getClientId = require('./src/helper/getClientId.helper');
    let getSyncDatabaseName = require('./src/helper/getSyncDatabaseName.helper');
    let databaseName = getSyncDatabaseName();


    let MqttListener = require('./src/MqttListener/MqttListener');
    let CurveMqttListener = require('./src/MqttListener/CurveMqttListener');
    let MqttUploader = require('./src/MqttUploader/MqttUploader');
    let curveStatusController = require('./src/CurveStatusUpdater/CurveStatusController');
    console.log(databaseName);

    let localMqttQueue = new MqttUploader(databaseName);

    //new MqttListener(orderingQueueLocal, config.get("mqtt.local"), {clean: false, clientId: getClientId()});
    new MqttListener(localMqttQueue, config.get("mqtt.local"), {clean: false, clientId: getClientId()});
    new MqttListener(orderingQueueCloud, config.get("mqtt.cloud"), {clean: false, clientId: getClientId(), rejectUnauthorized: false});
    new CurveMqttListener(curveStatusController, config.get("mqtt.local"), {clean: false, clientId: getClientId() + 'curveChannel', rejectUnauthorized: false});

    let MySqlExecutor = require("./src/MySqlExecutor/mysqlExecutor");

    let cloudSqlConfig = {
        host: config.get("mysql.cloud.host"),
        port: config.get("mysql.cloud.port"),
        user: config.get("mysql.cloud.user"),
        password: config.get("mysql.cloud.password"),
        database: databaseName
    };

    let localSqlConfig = {
        host: config.get("mysql.local.host"),
        port: config.get("mysql.local.port"),
        user: config.get("mysql.local.user"),
        password: config.get("mysql.local.password"),
        database: databaseName
    };

    // let cloudMySqlExecutor = new MySqlExecutor(cloudSqlConfig, localQueue);
    let localMySqlExecutor = new MySqlExecutor(localSqlConfig, cloudQueue);

    // cloudMySqlExecutor.run();
    localMySqlExecutor.run();

    console.log('Start synchronize server');

})();



