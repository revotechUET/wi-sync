const axios = require('axios');
const config = require('config');
let CurveStatus = require('./curve-status.model').model;
let downloadCurves = require('./../helper/download-curve-runner');
let uploadCurves = require('./../helper/upload-curve');

let syncServerPath = process.env.SYNC_SERVER || config.syncServer;

function indexOfPath(arr, path) {
    for (let i = 0; i < arr.length; i++) {
        if (path.toString() === arr[i].path.toString()) {
            return i;
        }
    }
    return -1;
}

class CurveUpdater {
    constructor(username) {
        this.username = username;
    }

    runUpdaterScheduler(time) {
        let handleRun = async function() {
            try {
                let list = await getListUpdateAndRemove(this.username);
                let uploadList = list.uploadList;
                let downloadList = list.downloadList;
                if (downloadList.length > 0) {
                    downloadCurves(downloadList.map(e => e.curvePath));
                }
                if (uploadList.length > 0) {
                    await uploadCurves(uploadList.map(e=>e.curvePath), uploadList.map(e=>{
                        return {
                            path: e.curvePath,
                            updatedAt: new Date(e.updatedAt)
                        };
                    }));
                }
            } catch (e) {
                console.log(e.message);
                setTimeout(handleRun, 2 * time);
            }
        }
        setTimeout(handleRun, 0);
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
                            for (let i = 0; i < pathsFromLocal.length; i++) {
                                let path = pathsFromLocal[i];
                                let index = indexOfPath(pathsFromCloud, path);
                                if (index >= 0) {
                                    let dateOnCLoud = new Date(pathsFromCloud[index].updatedAt);
                                    let dateOnLocal = new Date(pathsFromCloud[i].updatedAt);
                                    if (dateOnCLoud.getTime() > dateOnLocal.getTime()) {
                                        //cloud has a update
                                        downloadList.push(path);
                                        try {
                                            await CurveStatus.findOneAndUpdate({path: path}, {updatedAt: new Date(dateOnCLoud)});
                                        } catch(e) {
                                            console.log(e.message);
                                        }
                                        pathsFromCloud.splice(index, 1);
                                    } else if (dateOnCLoud.getTime() < dateOnLocal.getTime()) {
                                        //local has a update
                                        uploadList.push(path);
                                        pathsFromCloud.splice(index, 1);
                                    } else {
                                        //nothing happen
                                        pathsFromCloud.splice(index, 1);
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