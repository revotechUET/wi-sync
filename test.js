let func = require('./src/helper/get-curve');
let config = require('config');
let axios = require('axios');
let fs = require('fs');
let uploadCurve = require('./src/helper/upload-curve');
const divideArr = require('./src/helper/divideArr.helper');

//uploadCurve(['/00c6d133/d493a7d1/c81d2c27/9df7c759/DPL.txt', '/00ca7add/9f56a682/d9b20e99/8f9c1426/RXOZ_CS_1.txt'], JSON.stringify({path: '/00c6d133/d493a7d1/c81d2c27/9df7c759/DPL.txt', updatedAt: new Date()})).then(res=>console.log(res)).catch(e=>console.log(e.message));

// function getCurveFiles(curvePaths,i) {
//     return axios({
//         url: config.get("curveProviderServer") + '/curve/download',
//         method: 'post',
//         data: {
//             curveFiles: curvePaths
//         },
//         responseType: 'stream',
//         onDownloadProgress: function (progressEvent) {
//             let percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             if (percent == 25) {
//                 console.log('percent of part', i + ': 25%');
//             }
//             if (percent == 50) {
//                 console.log('percent of part', i + ': 50%');
//             }
//             if (percent == 75) {
//                 console.log('percent of part', i + ': 75%');
//             }
//             if (percent == 100) {
//                 console.log('percent of part', i + ': 100%. Done');
//             }
//         }
//     });
// }



let downloadCurves = require('./src/helper/download-curve-runner');

(async function () {
    try {
        let userName = process.argv.slice(2)[0];
        let curvePaths = await func(config.get("mysql.local"), userName);
        console.log('Start download...');
        let smallerCurvePaths = divideArr(curvePaths, 100);
        downloadCurves(smallerCurvePaths);
        // let n = smallerCurvePaths.length; 
        // let count = 0;
        // for (let i = 0; i < n; i++) {
        //         getCurveFiles(smallerCurvePaths[i], i+1).then((res)=>{
        //             let downloadStatus = res.data.pipe(fs.createWriteStream('downloads/curvedownload'+i+'.zip'));
        //             downloadStatus.on('close',()=>{
        //                 count += 1;
        //                 console.log('Finish download part ' + i + ': done ' + count + '/' + n + ' part');
        //             });
        //         }).catch((e)=>{
        //             console.log('Download curve part', i, 'failed:', e.message);
        //         });
        // }
    } catch (e) {
        console.log(e.message);
    }
})();
