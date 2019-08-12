let config = require('config');
let axios = require('axios');
let fs = require('fs');

function getCurveFiles(curvePaths,i) {
    return axios({
        url: config.get("curveProviderServer") + '/curve/download',
        method: 'post',
        data: {
            curveFiles: curvePaths
        },
        responseType: 'stream',
        onDownloadProgress: function (progressEvent) {
            let percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (percent == 25) {
                console.log('percent of part', i + ': 25%');
            }
            if (percent == 50) {
                console.log('percent of part', i + ': 50%');
            }
            if (percent == 75) {
                console.log('percent of part', i + ': 75%');
            }
            if (percent == 100) {
                console.log('percent of part', i + ': 100%. Done');
            }
        }
    });
}

function downloadCurveRunner(curvePaths)  {
    return new Promise((resolve, reject)=>{
        let handleRun = function() {
            
        }
    });
}