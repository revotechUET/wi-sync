let mqtt = require('mqtt');
let getClientId = require('./../helper/getClientId.helper');

class MqttUploader {
    constructor(channel, mongoQueue) {
        this.queue = mongoQueue;
        this.channel = channel;
        this.connectState = false;
        this.client = mqtt.connect(require("config").get("mqtt.cloud"), {rejectUnauthorized: false});
        this.client.on('connect', ()=>{
            this.setStateOn();
        });

        this.client.on('offline', ()=>{
            this.setStateOff();
        });
        this.client.on('error', (e)=>{
            console.log('Mqtt uploader error:', e.message);
        });
    }

    setStateOn() {
        this.connectState = true;
        this.run();
    }

    setStateOff() {
        this.connectState = false;
    }

    run() {
        let self = this;
        let handleRun = function() {
            let data = self.queue.dequeue();
            if (data) {
                self.client.publish(self.channel, data.toString(), {qos: 2}, (err) => {
                    if (err) {
                        //donothing
                    } else {
                        self.queue.deleteTail();
                    }
                    if (self.connectState) {
                        setTimeout(handleRun, 0);
                    }
                });
            } else {
                setTimeout(handleRun, 1000);
            }
        };
        setTimeout(handleRun,0);
    }

}

module.exports = MqttUploader;