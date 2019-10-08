const sync = require('./main-run');

let mongoUrl = "mongodb://";
let config = require("config");
mongoUrl = mongoUrl + config.get("mongo.host") + ":" + config.get("mongo.port") + "/" + config.get("mongo.queueDataBase");
let mongoose = require('mongoose');
let SyncList = require('./src/model/sync_user.model');

(async function() {
    //console.log(mongoUrl);
    try {
        await mongoose.connect(mongoUrl, {useNewUrlParser: true});
    } catch (err) {
        console.log('Mongo database out of reach');
        return;
    }

    console.log('Start synchronize server...');

    SyncList.find({}, (err, results)=>{
        
        if (err) {
            console.log('Error when get sync list');
            return -1;
        }

        if (!results) {
            console.log('Error when get sync list');
            return -1;
        }

        for (let i = 0; i < results.length; i++) {
            try {
                sync(results[i].username);
            } catch (e) {
                console.log(e);
            }
        }

        const express = require('express');

        const app = express();
        const bodyParser = require('body-parser');
        const cors = require('cors');

        const port = process.env.PORT || 9099;

        app.use(bodyParser.urlencoded({ extended: false }));

        app.use(bodyParser.json());

        app.use(cors());

        const mysqlApi = require('./src/router/mysql-sync/mysql.route');
        
        app.use('/mysql', mysqlApi);
        app.use('/sync', require('./src/router/sync/sync.route'));

        app.listen(port, () => {
            console.log('App listening in port ', port);
        });
    });

})();



