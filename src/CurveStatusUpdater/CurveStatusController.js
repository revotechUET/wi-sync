let CurveStatus = require('./curve-status.model').model;

class CurveStatusController {
    constructor(deleteOutputQueue) {
        this.deleteOutputQueue = deleteOutputQueue;
        this.queue = [];
        this.runUpdateEventIntoDatabase();
    }

    pushDeleteEvent(mess) {
        mess.eventType = 'delete';
        this.queue.unshift(mess);
    }

    pushUpdateEvent(mess) {
        mess.eventType = 'update';
        this.queue.unshift(mess);
    }

    runUpdateEventIntoDatabase() {
        let self = this;
        let handleRun = async function() {
            if (self.queue.length > 0) {
                let data = self.queue.pop();
                try {
                    await self.tryToImportToDb(data);
                } catch (e) {
                    console.log(e.message);
                }
                setTimeout(handleRun,0);
            } else {
                setTimeout(handleRun, 1000);
            }
        };
        setTimeout(handleRun,0);
    }


    tryToImportToDb(mess) {
        console.log(mess);
        return new Promise((resolve, reject) => {
            if (mess.eventType.toString() === 'delete') {
                //try to delete
                CurveStatus.findOneAndDelete({path: mess.curvePath}, (err, rs)=>{
                    console.log(rs);
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log('deleted');
                        this.deleteOutputQueue.enqueue(JSON.stringify(mess)).catch((e)=>{
                            console.log('Enqueue delete curve event into mongo queue failed:', e.message);
                        });
                        resolve(null);
                    }
                });
            } else {
                CurveStatus.findOne({path: mess.curvePath}, (err, rs)=>{
                    if (err) {
                        reject(err);
                    } else {
                        if (rs) {
                            let dateInMess = new Date(mess.updatedAt);
                            if (dateInMess.getTime() > new Date(rs.updatedAt).getTime()) {
                                rs.updatedAt = dateInMess;
                                rs.save((err)=>{
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(null);
                                    }
                                });
                            }
                        } else {
                            let newCurvePath = new CurveStatus({
                                path: mess.curvePath,
                                user: mess.user,
                                updatedAt: new Date("1970")
                            });
                            newCurvePath.save(err=>{
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(null);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
}

module.exports = CurveStatusController;