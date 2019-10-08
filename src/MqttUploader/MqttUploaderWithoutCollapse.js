let mqtt = require('mqtt');
let getClientId = require('./../helper/getClientId.helper');

class MqttUploaderWithoutCollapse {
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
        this.clientId = getClientId();
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
                data  = {
                    clientId: self.clientId,
                    data: data
                }
                console.log(data);
                self.client.publish(self.channel, JSON.stringify(data), {qos: 2}, async (err) => {
                    if (err) {
                        console.log(err.message);
                    } else {
                        try {
                            //console.log(data);
                            await self.queue.deleteTail();
                        } catch (e) {
                            console.log('delete tail:', e);
                        }
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

module.exports = MqttUploaderWithoutCollapse;