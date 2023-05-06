import * as fs from 'fs';

console.log('Incrementing build number...');

fs.readFile('./package.json', function (err, content) {
    if (err) throw err;
    const packageData = JSON.parse(content);
    packageData.buildNumber = packageData.buildNumber + 1;
    packageData.buildDate = (new Date()).toISOString();
    fs.writeFile('./package.json',JSON.stringify(packageData, null, 2),function(err){
        if (err) throw err;
        console.log(`Current version: ${packageData.version} (${packageData.buildNumber} - ${packageData.buildDate})`);
    })
});