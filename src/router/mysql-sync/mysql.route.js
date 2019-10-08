const apiFunc = require('./mysql.api');
const express = require('express');
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

const router = express.Router();


// route.post('/sync-from-base', async(req,res)=>{
//     let username = req.body.username;
//     let cloudFile = await apiFunc.exportToFile(mySqlCloudConfig, mySqlCloudConfig.prefix + username);
//     let localFile = await apiFunc.exportToFile(mySqlLocalConfig, mySqlLocalConfig.prefix + username);
//     let linkMerged = await apiFunc.mergeFile(localFile, cloudFile);

// });

module.exports = router;