const axios = require('axios');
const config = require('config');
let CurveStatus = require('./curve-status.model').model;

let syncServerPath = config.syncServer;

class CurveUpdater {
    constructor() {
        
    }

    getListUpdateAndRemove(username) {
        return new Promise((resolve, reject)=>{
            axios.post(syncServerPath + '/curve/get-status', {username: username})
            .then((res)=>{
                let res = res.data;
                if (res.code) {
                    let pathsFromCloud = res.payload;
                    CurveStatus.find({user: username}, (err, pathsFromLocal)=>{
                        if (err) {
                            reject(err.message);
                        } else {
                            pathsFromLocal = pathsFromLocal || [];
                            let downloadList = [];
                            let uploadList = [];
                            let pathsFromCloudStringOnly = pathsFromCloud.map(e => e.curvePath);
                            let pathsFromLocalStringOnly = pathsFromLocal.map(e => e.curvePath);
                            for (let i = 0; i < pathsFromLocalStringOnly.length; i++) {
                                let path = pathsFromLocalStringOnly[i];
                                let index = pathsFromCloudStringOnly.indexOf(path);
                                if (index >= 0) {
                                    let dateOnCLoud = new Date(pathsFromCloud[index].updatedAt);
                                    let dateOnLocal = new Date(pathsFromCloud[i].updatedAt);
                                    if (dateOnCLoud.getTime() > dateOnLocal.getTime()) {
                                        //cloud has a update
                                        downloadList.push(path);
                                        pathsFromCloudStringOnly.splice(index, 1);
                                    } else if (dateOnCLoud.getTime() < dateOnLocal.getTime()) {
                                        //local has a update
                                        uploadList.push(path);
                                        pathsFromCloudStringOnly.splice(index, 1);
                                    } else {
                                        //nothing happen
                                        pathsFromCloudStringOnly.splice(index, 1);
                                    }
                                } else {
                                    uploadList.push(path);
                                }
                            }
                            downloadList.push(...pathsFromCloudStringOnly);
                            resolve({
                                downloadList: downloadList,
                                uploadList: uploadList
                            });
                        }
                    });
                } else {
                    reject(res.reason);
                }
            })
            .catch((e)=>{
                reject(e.message);
            });
        });
    }
}