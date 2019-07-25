module.exports = function(command) {
    let exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        let childProcess = exec(command, {
            cwd: './'
        });
        childProcess.on('close', (code,err)=>{
            resolve(code);
        });
        // childProcess.stderr.on('data', (data)=> {
        //    console.log('stdout: ', data);
        // });
        // childProcess.stdout.on('data', (data)=> {
        //     console.log('stderr: ', data);
        // });
        // childProcess.on('exit', (code)=>{
        //     if (code === 0) {
        //         console.log(command + ': ' + code);
        //         resolve(code);
        //     } else {
        //         reject('Error code: ' + code);
        //     }
        // });
    });
};