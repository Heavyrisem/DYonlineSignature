require('./log').init('wh');
const express = require('express');
const app = express();
const { exec, spawn } = require('child_process');
const kill = require('kill-port');
const servicePort = 80;

let service;
let serverOnline = false;

const bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            resolve()
        }, time);
    });
}

function startServer(platform) {
    if (serverOnline) return;
    switch (platform) {
        case "win32": {

            serverOnline = true;
            service = spawn("run.bat");
            // service = spawn("cmd", ['/C','serve' ,'-s', '../build', '-l', servicePort, '-n']);
            // service.stdout.on("data", (chunk) => {console.log(chunk+"")});
            console.log("Server is Online !");
            break;

        }
        // case "linux": {

        //     serverOnline = true;
        //     service = spawn("sh", ['run.sh']);
        //     service.stdout.on("data", (chunk) => {console.log(chunk+"")});
        //     console.log("Server started");
        //     break;

        // }
        default: console.log("This platform is not support!"); break;
    }
}

async function stopServer() {
    return new Promise(async (resolve, reject) => {

        await kill(servicePort, "tcp");
        serverOnline = false;
        console.log("Server Stopping ...");
        resolve();

    });
}

async function Prepare(req, res) {
    let now = new Date();
    console.log("---------- New Commit has Arrive ----------");
    console.log(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`);
    if (req.body.ref != "refs/heads/master") {
        console.log("Branch is Diff", req.body.ref);
        return res.send({status: "Branch is Diff", err: req.body.ref});
    }
    exec('git reset --hard HEAD', (err, stdout, stderr) => {
        if (err) return res.send({status: "Git reset error", err: err});
        if (stdout.indexOf("HEAD is now at") == -1) return res.send({status: "Git reset error", err: err});
        console.log(stdout);

        exec('git pull', async (err, stdout, stderr) => {
            if (err) {
                res.send({status: "GIT_PULL_ERR", err: err});
                console.log("git pull: ", err)
            } else {
                if (stdout.indexOf("Already up to date.") != -1 || stdout.indexOf("이미") != -1) {
                    console.log("Already up to date.");
                    return res.send({status: "NOTHING_TO_UPDATE"});
                }
                if (stdout.indexOf("Aborting") != -1) {
                    console.log("Git Pull Fail");
                    return res.send({status: "Git Pull Fail"});
                }
                else console.log(stdout);
    
                console.log("-------------- Server Restart --------------");
                await stopServer();
                startServer(process.platform);
                console.log("-------------- Server Restart Finish --------------");
            }
        });

    });
}

app.post("/wh", async (req, res) => {
    Prepare(req, res);
});

app.listen(9800, async () => {
    await stopServer();
    startServer(process.platform);
    console.log("webhook server is open 9800");
})
