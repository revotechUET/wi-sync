const mqtt = require('mqtt');

class CurveMqttListener {
    constructor(output, url, options, username) {
        this.url = url;
        this.options = options;
        this.output = output;
        this.client = mqtt.connect(url, options);
        this.username = username;
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
        this.client.subscribe("curve/delete/" + this.username, {qos:2});
        this.client.subscribe("curve/update/" + this.username, {qos:2});
        this.client.on('message', (topic, payload)=>{
            console.log(payload.toString());
            if (topic.toString().indexOf("curve/delete") === 0) {
                this.output.pushDeleteEvent(JSON.parse(payload.toString()));
            } else if (topic.toString().indexOf("curve/update") === 0) {
                this.output.pushUpdateEvent(JSON.parse(payload.toString()));
            }
        });
    }
}

module.exports = CurveMqttListener;