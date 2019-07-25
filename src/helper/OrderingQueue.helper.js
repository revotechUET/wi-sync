class OrderingQueue {
    constructor(mongoQueue) {
        this.queue = [];
        this.mongoQueue = mongoQueue;
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
                    console.log('Error when trying to enqueue into mongo queue');
                    process.exit(1);
                }
            } else {
                setTimeout(handleRun,50);
            }
        };
        setTimeout(handleRun,0);
    }

    push(data) {
        this.queue.unshift(data);
    }
}

module.exports = OrderingQueue;

