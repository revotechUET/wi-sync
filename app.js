const express = require('express');

const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3035;

const mysqlApi = require('./server/mysql-sync/mysql.route');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use('/mysql', mysqlApi);

app.listen(port, () => {
    console.log('App listening in port ', port);
});
