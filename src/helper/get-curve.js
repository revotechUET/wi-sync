const mysql2 = require('mysql2/promise');
const createPath = require('./createPath');

module.exports = function (config, username) {
    let mysqlConfig = {
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
        database: config.prefix + username
    };
    return new Promise(async (resolve, reject)=> {
        try {
            let connection = await mysql2.createConnection(mysqlConfig);
            let [projects] = await connection.query('SELECT * FROM project');
            let n = projects.length;
            let wells = [];
            for (let i = 0; i < n; i++) {
                let [wellsFromQuery] = await connection.execute('SELECT * FROM well WHERE idProject = ?', [projects[i].idProject]);
                wellsFromQuery = wellsFromQuery.map(e=>{
                    e.projectName = projects[i].name;
                    return e;
                });
                wells.push(...wellsFromQuery);
            }
            n = wells.length;
            let datasets = [];
            for (let i = 0; i < n; i++) {
                let [datasetsFromQuery] = await connection.execute('SELECT * FROM dataset WHERE idWell = ?', [wells[i].idWell]);
                datasetsFromQuery = datasetsFromQuery.map(e=>{
                    e.projectName = wells[i].projectName;
                    e.wellName = wells[i].name;
                    return e;
                });
                datasets.push(...datasetsFromQuery);
            }
            n = datasets.length;
            let curves = [];
            for (let i = 0; i < n; i++) {
                let [curvesFromQuery] = await connection.execute('SELECT * FROM curve WHERE idDataset = ?', [datasets[i].idDataset]);
                curvesFromQuery = curvesFromQuery.map(e=>{
                    e.projectName = datasets[i].projectName;
                    e.wellName = datasets[i].wellName;
                    e.datasetName = datasets[i].name;
                    return e;
                });
                curves.push(...curvesFromQuery);
            }
            curves = curves.map(e=>{
                return createPath('', username + e.projectName + e.wellName + e.datasetName + e.name, e.name + '.txt');
            });
            connection.end();
            resolve(curves);
        } catch (e) {
            reject(e.message);
        } 
    });
};