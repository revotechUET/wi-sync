let crypto = require('crypto');
const LEN = 8;

function createDirSync(basePath, hash, dir) {
	dir.push(hash.substr(0, LEN));
	return hash.substr(LEN);
}

module.exports = function (basePath, hashString, fileName) {
	//console.log("HASHSTRING : " + hashString);
	let md5sum = crypto.createHash('md5');
	md5sum.update(hashString);
	let hash = md5sum.digest('hex');
	let dirs = [];
	while (hash.length > 0) {
        hash = createDirSync(basePath, hash, dirs);
    }
	return basePath + '/' + dirs.join('/') + '/' + fileName;
}