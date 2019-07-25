let client = require('mqtt').connect(require('config').get("mqtt.cloud"), {clean: false, clientId: 'any', rejectUnauthorized: false});

client.subscribe('sync/#', {qos: 2});

client.on('connected', ()=> {
    console.log('connected');
});

client.on('message', (topic, payload) => {
    payload = payload.toString();
    console.log(topic+':',payload);
});