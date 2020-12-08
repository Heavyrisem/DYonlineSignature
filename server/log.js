const fs = require("fs");
const logpath = `./logs/${LogFileName()}.txt`;
fs.writeFileSync(logpath, "Log Started\n");

function LogFileName() {
    let now = new Date();
    return `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`;
}

function writeLog(write) {
    return function(string) {
        switch (typeof string) {
            case "object":
                string = replaceAll(JSON.stringify(string), `"`, " ");
                break;
        }
            
        fs.appendFileSync(logpath, string);
        write.apply(process.stdout, arguments)
    }
}

function replaceAll(originstr, findstr, replacestr) {
    return originstr.split(findstr).join(replacestr);
}

function init() {
    process.stdout.write = (writeLog)(process.stdout.write);
}

exports.init = init;