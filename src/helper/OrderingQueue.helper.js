class OrderingQueue {
    constructor(mongoQueue) {
        this.queue = [];
        this.mongoQueue = mongoQueue;
        this.run();
    }

    run() {
        let self = this;
        let handleRun = async function() {
            if (self.queue.length > 0) {
                let data = self.queue.pop();
                try {
                    await self.mongoQueue.enqueue(data);
                    setTimeout(handleRun,0);
                } catch (e) {
                    console.log('Error when trying to enqueue into mongo queue:', e.message);
                    console.log('YOU SHOULD CLOSE THE SYNC APP AND RE-SYNC BECAUSE THIS IS AN IMPORTANT ERROR');
                }
            } else {
                setTimeout(handleRun, 500);
            }
        };
        setTimeout(handleRun,0);
    }

    push(data) {
        this.queue.unshift(data);
    }
}

module.exports = OrderingQueue;

