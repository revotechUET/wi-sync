const axios = require('axios');
const config = require('config');
let CurveStatus = require('./curve-status.model').model;
let downloadCurves = require('./../helper/download-curve-runner');
let uploadCurves = require('./../helper/upload-curve');

let syncServerPath = process.env.SYNC_SERVER || config.syncServer;

function indexOfPath(arr, path) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].path) {
            if (path.toString() === arr[i].path.toString()) {
                return i;
            }
        }
    }
    return -1;
}

class CurveUpdater {
    constructor(username) {
        this.username = username;
        this.time = 1*1000*60;
        this.runUpdaterScheduler();
    }

    runUpdaterScheduler() {
        let time = this.time;
        let self = this;
        let handleRun = async function() {
            try {
                console.log('Start update curve file...');
                let list = await self.getListUpdateAndRemove();
                let uploadList = list.uploadList;
                let downloadList = list.downloadList;
                console.log('downloadList:', downloadList);
                console.log('uploadList:', uploadList);
                if (downloadList.length > 0) {
                    let temp = downloadList.map(e => {
                        if (e.path) {
                            return e.path;
                        } else {
                            return 'nothing';
                        }
                    });
                    downloadCurves(temp);
                }
                if (uploadList.length > 0) {
                    await uploadCurves(uploadList.map(e=>e.path), uploadList.map(e=>{
                        return {
                            path: e.path,
                            updatedAt: new Date(e.updatedAt),
                            user: e.user
                        };
                    }));
                }
                setTimeout(handleRun, time);
            } catch (e) {
                console.log('Error:', e);
                setTimeout(handleRun, 2 * time);
            }
        }
        setTimeout(handleRun, 0);
    }

    getListUpdateAndRemove() {
        let self = this;
        return new Promise((resolve, reject)=>{
            axios.post(syncServerPath + '/curve/get-status', {username: self.username})
            .then((res)=>{
                res = res.data;
                if (res.code) {
                    let pathsFromCloud = res.payload;
                    console.log('res:', pathsFromCloud);
                    CurveStatus.find({user: self.username}, (err, pathsFromLocal)=>{
                        if (err) {
                            reject(err.message);
                        } else {
                            pathsFromLocal = pathsFromLocal || [];
                            console.log('local:', pathsFromLocal);
                            let downloadList = [];
                            let uploadList = [];
                            for (let i = 0; i < pathsFromLocal.length; i++) {
                                let path = pathsFromLocal[i].path;
                                let index = indexOfPath(pathsFromCloud, path);
                                if (index >= 0) {
                                    let dateOnCLoud = new Date(pathsFromCloud[index].updatedAt);
                                    let dateOnLocal = new Date(pathsFromLocal[i].updatedAt);
                                    if (dateOnCLoud.getTime() > dateOnLocal.getTime()) {
                                        //cloud has a update
                                        downloadList.push(pathsFromCloud[index]);
                                        CurveStatus.findOneAndUpdate({path: path}, {updatedAt: new Date(dateOnCLoud)}, (err, docs)=>{
                                            if (err) {
                                                console.log('update err:', err);
                                            }
                                        });
                                        pathsFromCloud.splice(index, 1);
                                    } else if (dateOnCLoud.getTime() < dateOnLocal.getTime()) {
                                        //local has a update
                                        uploadList.push(pathsFromLocal[i]);
                                        pathsFromCloud.splice(index, 1);
                                    } else {
                                        //nothing happen
                                        pathsFromCloud.splice(index, 1);
                                    }
                                } else {
                                    uploadList.push(path);
                                }
                            }
                            downloadList.push(...pathsFromCloud);
                            for (let i = 0; i < pathsFromCloud.length; i++) {
                                let newCurveStatus = new CurveStatus(pathsFromCloud[i]);
                                newCurveStatus.save((err)=>{
                                    if (err) {
                                        console.log('err:', err);
                                    }
                                });
                            }
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

module.exports = CurveUpdater;