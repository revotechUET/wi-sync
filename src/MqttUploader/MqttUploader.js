let mqtt = require('mqtt');
let getClientId = require('./../helper/getClientId.helper');

class MqttUploader {
    constructor(database) {
        this.queue = [];
        this.channel = "syncUp/";
        this.database = database;
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
        let handleRun = async function() {
            if (self.queue.length > 0) {
                let data = self.queue.pop();
                self.client.publish(self.channel + self.database, data.toString(), {qos: 2}, (err) => {
                    if (err) self.queue.push(data);
                    if (self.connectState) {
                        setTimeout(handleRun, 0);
                    }
                });
            } else {
                setTimeout(handleRun,50);
            }
        };
        setTimeout(handleRun,0);
    }

    push(value) {
        this.queue.unshift(value);
    }

}

module.exports = MqttUploader;