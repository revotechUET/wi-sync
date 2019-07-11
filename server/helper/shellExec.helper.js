module.exports = function(command) {
    let exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        exec(command, {
            cwd: './'
        });
        process.on('exit', (code)=>{
            if (code === 0) {
                resolve(code);
            } else {
                reject('Error code: ' + code);
            }
        });
    });
};