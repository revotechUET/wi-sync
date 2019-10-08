module.exports = async function(syncUsername) {
    let mongoUrl = "mongodb://";
    let config = require("config");

    // let getSyncDatabaseName = require('./src/helper/getSyncDatabaseName.helper');
    // let syncUsername = getSyncDatabaseName();
    
    //mongoUrl = mongoUrl + config.get("mongo.host") + ":" + config.get("mongo.port") + "/" + config.get("mongo.queueDataBase");

    const mongoose = require('mongoose');
    const NodeSchema = require('./src/MongoQueue/mongo.model');
    //connect mongo


    let nodeLocal = mongoose.model('NodeLocal_' + syncUsername, NodeSchema);
    let nodeCloud = mongoose.model('NodeCloud_' + syncUsername, NodeSchema);
    let nodeCurveDelete = mongoose.model('CurveDeleteQueue_' + syncUsername, NodeSchema);
    
    let MongoQueue = require("./src/MongoQueue/mongo.queue");

    let localQueue = new MongoQueue(nodeLocal);
    let cloudQueue = new MongoQueue(nodeCloud);
    let curveDeleteQueue = new MongoQueue(nodeCurveDelete);
    //load queue from database
    try {
        await localQueue.initLoad();
        await cloudQueue.initLoad();
        await curveDeleteQueue.initLoad();
    } catch(err) {
        console.log(err);
        return;
    }

    console.log('Mongo queue init successfully');

    let OrderingQueue = require('./src/helper/OrderingQueue.helper');
    let orderingQueueLocal = new OrderingQueue(localQueue);
    let orderingQueueCloud = new OrderingQueue(cloudQueue);


    let getClientId = require('./src/helper/getClientId.helper');

    let MqttListener = require('./src/MqttListener/MqttListener');
    let CurveMqttListener = require('./src/MqttListener/CurveMqttListener');
    let MqttUploader = require('./src/MqttUploader/MqttUploader');
    let MqttUploaderWithoutCollapse = require('./src/MqttUploader/MqttUploaderWithoutCollapse');
    let MqttListenerWithoutCollapse = require('./src/MqttListener/MqttListenerWithoutCollapse');
    
    let CurveStatusController = require('./src/CurveStatusUpdater/CurveStatusController');
    let curveStatusController = new CurveStatusController(curveDeleteQueue);
    
    console.log('Start sync server with:', syncUsername);

    let CurveGarbageCollector = require('./src/CurveStatusUpdater/CurveGarbageCollector');
    let curveGarbageCollector = new CurveGarbageCollector();
    let CurveUpdater = require('./src/CurveStatusUpdater/CurveUpdater');

    //new MqttListener(orderingQueueLocal, config.get("mqtt.local"), {clean: false, clientId: getClientId()});
    new MqttUploaderWithoutCollapse('syncUp/' + syncUsername, localQueue);
    new MqttListenerWithoutCollapse(orderingQueueCloud, config.get("mqtt.cloud"), 
                                    {clean: false, clientId: getClientId() + '_Sync_Up_' + syncUsername, rejectUnauthorized: false}, 
                                    'syncUp/'+syncUsername);
    new MqttUploader('curve/delete/' + syncUsername, curveDeleteQueue);
    new MqttListener(orderingQueueLocal, config.get("mqtt.local"), 
                    {clean: false, clientId: getClientId() + '_' + syncUsername}, 
                    'sync/' + syncUsername);
    new MqttListener(orderingQueueCloud, config.get("mqtt.cloud"), 
                    {clean: false, clientId: getClientId() + '_' + syncUsername, rejectUnauthorized: false},
                    'sync/' + syncUsername);
    new MqttListener(curveGarbageCollector, config.get("mqtt.cloud"), 
                    {clean: false, clientId: getClientId() + '_' + 'curveChannel' + '_' + syncUsername, rejectUnauthorized: false},
                    'curve/delete/' + syncUsername);
    new CurveMqttListener(curveStatusController, config.get("mqtt.local"),
                         {clean: false, clientId: getClientId() + '_' + 'curveChannel' + '_' + syncUsername},
                         syncUsername);
    new CurveUpdater(syncUsername);

    let MySqlExecutor = require("./src/MySqlExecutor/mysqlExecutor");

    // let cloudSqlConfig = {
    //     host: config.get("mysql.cloud.host"),
    //     port: config.get("mysql.cloud.port"),
    //     user: config.get("mysql.cloud.user"),
    //     password: config.get("mysql.cloud.password"),
    //     database: config.get("mysql.cloud.prefix") + syncUsername
    // };

    let localSqlConfig = {
        host: config.get("mysql.local.host"),
        port: config.get("mysql.local.port"),
        user: config.get("mysql.local.user"),
        password: config.get("mysql.local.password"),
        database: config.get("mysql.local.prefix") + syncUsername
    };

    // let cloudMySqlExecutor = new MySqlExecutor(cloudSqlConfig, localQueue);
    let localMySqlExecutor = new MySqlExecutor(localSqlConfig, cloudQueue);

    // cloudMySqlExecutor.run();
    localMySqlExecutor.run();
}