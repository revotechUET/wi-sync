let curveBaseFolder = process.env.BACKEND_CURVE_BASE_PATH || config.curveBasePath;
const deleteCurveFile = require('./../helper/deleteCurvePath');
const CurveStatus = require('./curve-status.model');

class CurveGarbageCollector {
    constructor() {
        this.queue = [];
        this.collectorRunner();
    }

    collectorRunner() {
        let handleRun = function() {
            if (this.queue.length > 0) {
                let path = this.queue.pop().curvePath;
                let fullPath = curveBaseFolder + path;
                deleteCurveFile(fullPath);
                CurveStatus.findOneAndDelete({
                    path: path
                }, (err, rs)=>{
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Success delete file curve:', path);
                    }
                    setTimeout(handleRun, 0);
                });
            } else {
                setTimeout(handleRun, 1000);
            }
        }
        setTimeout(handleRun, 0);
    }

    push(value) {
        this.queue.unshift(value);
    }
}

module.exports = CurveGarbageCollector;