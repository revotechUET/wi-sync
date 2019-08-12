let getClientId = require('./src/helper/getClientId.helper');
let client = require('mqtt').connect(require('config').get("mqtt.cloud"), {clean: false, clientId: getClientId(), rejectUnauthorized: false});

client.subscribe('curve/update', {qos: 2});
client.subscribe('curve/delete', {qos: 2});

client.on('connect', ()=> {
    console.log('connected');
});

client.on('message', (topic, payload) => {
    console.log(payload.toString());
    console.log(topic);
    // if (topic === "curve/update") {
    //     console.log('update:', JSON.parse(payload.toString()));
    // } else if (topic === "curve/delete") {
    //     console.log('delete:', JSON.parse(payload.toString()))
    // }
});