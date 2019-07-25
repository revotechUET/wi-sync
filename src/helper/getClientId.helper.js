module.exports = function() {
    let fs = require('fs');
    if (fs.existsSync('./extracts/clientId.txt')) {
        //get id in clientId
        return fs.readFileSync('./extracts/clientId.txt').toString();
    } else {
        let id = 'MQTT_LOCAL_' + new Date().toString();
        fs.writeFileSync('./extracts/clientId.txt', id);
        return id;
    }
};