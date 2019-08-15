let CurveStatus = require('./curve-status.model').model;

class CurveStatusController {
    constructor() {
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
                setTimeout(handleRun,50);
            }
        };
        setTimeout(handleRun,0);
    }

    tryToImportToDb(mess) {
        console.log(mess);
        return new Promise((resolve, reject) => {
            if (mess.eventType.toString() === 'delete') {
                //try to delete
                console.log(mess);
                CurveStatus.findOneAndDelete({path: mess.curvePath}, (err, rs)=>{
                    console.log(rs);
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log('deleted');
                        resolve(null);
                    }
                });
            } else {
                CurveStatus.findOne({path: mess.curvePath}, (err, rs)=>{
                    if (err) {
                        reject(err);
                    } else {
                        if (rs) {
                            rs.updatedAt = new Date(mess.updatedAt);
                            rs.save((err)=>{
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(null);
                                }
                            });
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




let controller = new CurveStatusController();

module.exports = controller;