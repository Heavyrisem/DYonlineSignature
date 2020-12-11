const config = require("./config.json");
require('./log').init('server');
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    // host: "smtp.gmail.com",
    service: "gmail",
    auth: {
        user: config.mailID,
        pass: config.mailPW
    }
});

const cors = require('cors');
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const fs = require("fs");

const crypto = require("crypto");
const key = crypto.scryptSync(config.crpytoKEY, 'salt', 24);
const iv = Buffer.alloc(16, 0);

require('greenlock-express').init({
    packageRoot: __dirname,
    configDir: './greenlock.d',
    maintainerEmail: 'pyo1748@gmail.com',
  }).serve(app);
app.use(cors());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static('../public'));
let submitedTestNo = [];

app.get("/test", (req,res) => {
    console.log(currentTime(), "/test 요청" ,req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    res.send("I`m Alive!");
})

app.get("/", (req, res) => {
    console.log(currentTime(), "index.html 요청" ,req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    fs.readFile(`../public/index.html`, (err, data) => {
        if (err) {
            console.log(currentTime(), "index.html", err);
            return res.send("페이지 로드 중 오류가 발생했습니다.");
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        }
    })
});

app.get("/decrypt", async (req, res) => {
    console.log(currentTime(), "데이터 복호화 요청", req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    fs.readFile(`../public/decrypt.html`, async (err, data) => {
        if (err) {
            console.log(currentTime(), "decrypt.html", err);
            return res.send("페이지 로드 중 오류가 발생했습니다.");
        } else {
            if (req.query.field) {

                let html = data.toString();
                let decrypted = await decrypt(req.query.field);
                if (decrypted == "PARSE_ERR") return res.send("데이터 복호화 중 오류 발생");
                let keys = Object.keys(decrypted);
                

                keys.forEach(name => {
                    html = html.replace(name.toUpperCase(), decrypted[name]);
                });
                
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(html);

            } else {
                res.send("입력된 데이터가 없습니다.");
            }
        }
    })
})

async function decrypt(field) {
    return new Promise((resolve, reject) => {

        try {
            let decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
            let decrypted = decipher.update(field, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            decrypted = JSON.parse(decrypted);
            resolve(decrypted);
        } catch (err) {
            console.log("PARSEERR", err);
            resolve("PARSE_ERR");
        }

    })
}

app.post("/upload", (req, res) => {
    if (req.body.token != config.certficationToken) return res.send("보안 코드가 일치하지 않습니다.");
    const userinput = req.body;
    let names = Object.keys(userinput);
    let problem = false;
    if (names.length != 12) return res.send("입력된 데이터의 갯수가 정확하지 않습니다.");
    names.some(name => {
        if (userinput[name] == undefined || userinput[name] == "") {
            req.send(`${name} 은 공백일수 없습니다. \n다시 입력해 주세요`);
            problem = true;
            return true;
        } else {
            return false;
        }
    });
    if (userinput["PayerNo"].length != 13 && !problem) {
        problem = true;
        return res.send("납부자 번호의 길이가 올바르지 않습니다.");
    }
    if (submitedTestNo.indexOf(userinput["testNo"]) != -1) {
        return res.send("이미 처리된 수험번호 입니다.");
    }




    // const mailText = `합격 과: ${userinput.sub}\n수험번호: ${userinput.testNo}\n이름: ${userinput.name}\n구분: ${userinput.type}\n출금동의일자: ${userinput.AccDay}\n예금주 성명: ${userinput.AccHolderName}\n학부모님 핸드폰번호: ${userinput.ParentPhone}\n계좌번호(농협): ${userinput.AccNo}\n신청인: ${userinput.WhoAreYou}\n예금주와 관계: ${userinput.Relation}\n납부자 번호: ${userinput.PayerNo}`;
    const mailText = JSON.stringify(userinput);
    if (mailText.indexOf("undefined") != -1) return res.send("누락된 정보가 있습니다.");

    let cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
    let crypted = cipher.update(mailText, 'utf8', 'hex');
    crypted += cipher.final('hex');

    let timer = Date.now();
    
    console.log(`${currentTime()} 수험번호 ${userinput.testNo} 메일 전송 준비 =====================`)
    const mailoption = {
        from: `${config.mailID}@gmail.com`,
        to: config.targetEmail,
        subject: `[${userinput.type}] ${userinput.name}`,
        text: `암호화된 데이터 입니다. 링크를 클릭하여 복호화된 정보를 확인하세요 \nhttps://dyonlinesignature.kro.kr/decrypt?field=${crypted}`
    }
    transporter.sendMail(mailoption, (err, info) => {
        if (err) console.log(currentTime(), "메일 발송 오류", err);
        if (err) return res.send("서버 처리 과정에서 오류가 발생했습니다. 잠시후 다시 시도해 주세요 (11)");
        console.log(currentTime(), "발송됨", mailoption.to);
        console.log(currentTime(), `수험번호 ${userinput.testNo} 메일 전송 완료 ====================================== Exit time: ${Date.now() - timer}ms`)
        submitedTestNo.push(userinput.testNo);
        res.send("정상 처리되었습니다.");
    })
})

function currentTime() {
    let now = new Date();
    return `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`;
}

app.listen(80, () => {
    console.log(currentTime(), "온라인 전자서명 서버 is online on 80 Port");
})