let axios = require('axios');
let fs = require('fs');
let config = require('config');

// axios.post('http://localhost:3010/curve/download', {curveFiles: ["/a5b6346b/87b16641/77a2be27/50d31604/4214.txt", "/6ff1e020/82956395/d4b272cc/553b0afe/123.txt"]})
// .then((res)=>{
//     res.data.pipe(fs.createWriteStream('downloadfile.zip'));
// });


axios({
    url: config.curveProviderServer + '/curve/download',
    method: 'post',
    data : {
        curveFiles: ["/a5b6346b/87b16641/77a2be27/50d31604/4214.txt", "/6ff1e020/82956395/d4b272cc/553b0afe/123.txt"]
    },
    responseType: 'stream'
}).then((res)=>{
    res.data.pipe(fs.createWriteStream('downloadfile.zip'));
});