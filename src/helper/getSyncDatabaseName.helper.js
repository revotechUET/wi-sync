module.exports = function() {
    // return "hoang";
    let fs = require('fs');
    if (fs.existsSync('./extracts/syncUser.txt')) {
        //get id in clientId
        return fs.readFileSync('./extracts/synUser.txt').toString();
    } else {
        let id = 'MQTT_LOCAL_' + new Date().toString();
        fs.writeFileSync('./extracts/clientId.txt', id);
        return id;
    }
};