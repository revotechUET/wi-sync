const mqtt = require('mqtt');
//let prefix = require('config').get("Database.prefix");

class MqttListener {
    
    constructor(output, url, options, subcribeChannel, discardOption) {
        this.url = url;
        this.options = options;
        this.output = output;
        this.client = mqtt.connect(url, options);
        this.subcribeChannel = subcribeChannel || 'sync/#';
        this.assign();
        this.timeStamp = 0;
    }

    reconnect() {
        if ((Date.now() - this.timeStamp) > 15*1000) {
            this.timeStamp = Date.now();
            this.client.end(true);
            console.log('Try to init new connection');
            this.client = mqtt.connect(this.url, this.options);
            this.assign();
        }
    }

    assign() {
        this.client.on('connect', ()=>{
            console.log('Connected to:', this.url);
        });
        this.client.on('disconnect', ()=>{
            console.log('Disconnect to:', this.url);
        });
        this.client.on('close', ()=>{
            console.log('Closed to:', this.url);
        });
        this.client.on('offline', ()=>{
            console.log('Offline to:', this.url);
        });
        this.client.on('error', (e)=>{
            if (e.message.toString() === "Connection refused: Identifier rejected") {
                this.reconnect();
            } else {
                console.log('Mqtt connection error:', e.message);
            }
        });
        this.client.subscribe(this.subcribeChannel, {qos:2}, ()=>{
            console.log('start listen to', this.subcribeChannel, 'with option:', this.options);
        });
        this.client.on('message', (topic, payload)=>{
            console.log(payload.toString());
            this.output.push(payload.toString());
        });
    }
}

module.exports = MqttListener;