const axios = require('axios');
const config = require('config');
const FormData = require('form-data');
const archiver = require('archiver');
const fs = require('fs');

let transferServerPath = process.env.TRANSFER_SERVER || config.dataProviderServer;
let curveBaseFolder = process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath;

function uploadCurves(curvePaths, curveUpdateInfo) {
    return new Promise((resolve, reject)=>{
        let listFileCurve = curvePaths.map(e=> curveBaseFolder + e);
    
        let outputName = './uploads' + '/curves_' + Date.now() + '_' + Math.floor(Math.random() * 100000) + '.zip';
    
        let n = listFileCurve.length;
    
        let output = fs.createWriteStream(outputName);
        let archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        archive.pipe(output);

        for (let i = 0; i < n; i++) {
            if (fs.existsSync(listFileCurve[i])) {
                archive.append(fs.createReadStream(listFileCurve[i]), { name: curvePaths[i] });
            }
        }

        output.on('finish', () => {
            console.log('finish');
            let uploadFile = new FormData();
            let file = fs.createReadStream(outputName);
            uploadFile.append('curve', file);
            uploadFile.append('curveInfo', JSON.stringify(curveUpdateInfo));
            console.log(uploadFile.getHeaders());
            axios.post(
                transferServerPath + '/curve/upload', 
                uploadFile,
                {headers: {
                    ...uploadFile.getHeaders()
                }}
            ).then(res=>{
                res = res.data;
                if (res.code) {
                    resolve(res);
                    fs.unlinkSync(outputName);
                } else {
                    reject({message: res.reason});
                    fs.unlinkSync(outputName);
                }
            }).catch(e=>{
                reject(e);
            });
        });

        archive.finalize().catch((err)=>{
            reject(err);
        });
    });
}

module.exports = uploadCurves;