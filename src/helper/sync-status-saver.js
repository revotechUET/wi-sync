const SYNCING = 0;
const DONE = 1;
const UNDEFINED = 2;

class SyncStatusSave {
    constructor() {
        this.queue = [];
    }

    startSync(username) {
        let found = false;
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].username == username) {
                this.queue[i].status = SYNCING;
                found = true;
            }
        }
        if (found) return;
        this.queue.push({username: username, status: SYNCING});
    }

    finishSync(username) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].username == username) {
                this.queue[i].status = DONE;
            }
        }
    }

    getStatus(username) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].username == username) {
                return this.queue[i].status;
            }
        }
        return UNDEFINED;
    }
}

let syncStatusSaver = new SyncStatusSave();

module.exports = syncStatusSaver;