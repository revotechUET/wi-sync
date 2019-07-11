const apiFunc = require('./mysql.api');
const express = require('express');
const config = require('config');

let mySqlLocalConfig = config.get("mysql.local");

const router = express.Router();

router.post('/local/export', async (req, res) => {
    let databaseName = req.body.databaseName;
    try {
        await apiFunc.exportToFile(mySqlLocalConfig, databaseName);
    } catch (e) {
        res.json({
            "code": 512,
            "reason": e.message
        });
        console.log(e);
        return;
    }
    res.json({
        "code": 200,
        "reason": "dump database successfully"
    });
});

module.exports = router;