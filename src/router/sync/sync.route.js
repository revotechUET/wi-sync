const express = require('express');
const config = require('config');
const router = express.Router();
const axios = require('axios');
let syncFromCloud = require('./../../helper/sync');
let syncStatusSaver = require('./../../helper/sync-status-saver');
let makeSync = require('./../../../main-run');
let SyncList = require('./../../model/sync_user.model');

//sync status
//reference
const SYNCING = 0;
const DONE = 1;
const UNDEFINED = 2;

let SYNC_STATUS = ['SYNCING', 'DONE', 'UNDEFINED'];

router.post('/start', async (req,res)=>{
    let username = req.body.username;
    if (syncStatusSaver.getStatus(username) == SYNCING) {
        res.json({
            code: 200,
            reason: 'Server is running sync this user',
            payload: {}
        });
        return;
    }
    SyncList.findOne({username: username}, async (err, rs)=>{
        if (err) {
            res.json({
                code: 512,
                reason: 'server error when try to access to mongodb',
                payload: {}
            });
            return;
        }
        if (rs) {
            res.json({
                code: 200,
                reason: 'already sync, but clone again database',
                payload: {}
            });
            try {
                syncStatusSaver.startSync(username);
                await syncFromCloud(username);
                syncStatusSaver.finishSync(username);
            } catch (e) {
                console.log(e);
            }
        } else {
            // axios.post(config.get("authServer") + '/update', {})
            // .then(async (res)=>{
            //     res = res.data;
            //     if (res.code == 200) {
            //         res.json({
            //             code: 200,
            //             reason: 'start syncing',
            //             payload: {}
            //         });
            res.json({
                code: 200,
                reason: 'start syncing',
                payload: {}
            });
            try {
                syncStatusSaver.startSync(username);
                await syncFromCloud(username);
                syncStatusSaver.finishSync(username);
                //save to syncList:
                makeSync(username);
                let syncUser = new SyncList({
                    username: username
                });
                syncUser.save((err)=>{
                    console.log('ERROR in saving');
                });
            } catch (e) {
                console.log(e);
            }
            //     } else {
            //         res.json({
            //             code: 512,
            //             reason: 'Can not sync if there is no database',
            //             payload: {}
            //         });
            //     }
            // });
        }
    });
});

router.post('/status', async (req, res)=>{
    let username = req.body.username;
    res.json({
        code: 200,
        reason: "successfully",
        payload: {
            status: SYNC_STATUS[syncStatusSaver.getStatus(username)]
        }
    });
});


module.exports = router;