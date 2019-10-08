let config = require('config');
let axios = require('axios');
let fs = require('fs');
let unzip = require('unzip-stream');
let divideArr = require('./divideArr.helper');

let curveBaseFolder = process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath;
let transferServerPath = process.env.TRANSFER_SERVER || config.dataProviderServer;

function getCurveFiles(curvePaths) {
    console.log(curvePaths);
    return axios({
        url: transferServerPath + '/curve/download',
        method: 'post',
        data: {
            curveFiles: curvePaths
        },
        responseType: 'stream'
    });
}

function downloadCurveRunner(curvePaths, pathNumber, maxiumTrialTimeOption)  {
    let path = 'downloads/curvedownload' + pathNumber + '.zip';
    let maxiumTrialTime = maxiumTrialTimeOption || 5;
    let count = 0;
    return new Promise((resolve, reject)=>{
        let handleRun = function() {
            console.log('Start download part ' + pathNumber + '...');
            count += 1;
            getCurveFiles(curvePaths)
            .then((res)=>{
                let downloadStatus = res.data.pipe(fs.createWriteStream(path));
                downloadStatus.on('close',()=>{
                    let unzipProcesss = fs.createReadStream(path).pipe(unzip.Extract({ path: curveBaseFolder}));
                    unzipProcesss.on('error', (e)=>{
                        if (count > maxiumTrialTime) {
                            reject(e.message);
                        } else {
                            console.log(e.message);
                            setTimeout(handleRun, 0);
                        }
                    });
                    unzipProcesss.on('close', ()=>{
                        try {
                            //fs.unlinkSync(path);
                            resolve(null);
                        } catch (e) {
                            console.log(e.message);
                        }
                    });

                });
                downloadStatus.on('error', (e)=>{
                    if (count > maxiumTrialTime) {
                        reject(e.message);
                    } else {
                        console.log('Try to download again part ' + pathNumber + '...');
                        setTimeout(handleRun, 0);
                    }
                });
            })
            .catch(e=>{
                console.log(e.message);
                if (count > maxiumTrialTime) {
                    console.log('maxium trial time for downloading part ' + pathNumber);
                    reject(e.message);
                } else {
                    console.log('Try to download again part ' + pathNumber + '...');
                    setTimeout(handleRun, 0);
                }
            });
        }
        setTimeout(handleRun, 0);
    });
}

function downloadCurves(curvesPathArrs) {
    curvesPathArrs = divideArr(curvesPathArrs, 100);
    let n = curvesPathArrs.length;
    for (let i = 0; i < n; i++) {
        downloadCurveRunner(curvesPathArrs[i], i)
        .then((rs)=>{
            console.log('Finish download part ' + i);
        })
        .catch(e => {
            console.log('Download failed for part ' + i);
        });
    }
}

module.exports = downloadCurves;