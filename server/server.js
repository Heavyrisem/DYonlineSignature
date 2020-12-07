const config = require("./config.json");

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
let proccessed = 0;

app.get("test", (req,res) => {
    res.send("I`m Alive!");
})

app.get("/", (req, res) => {
    fs.readFile(`../public/index.html`, (err, data) => {
        if (err) {
            console.log(err);
            return res.send("페이지 로드 중 오류가 발생했습니다.");
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        }
    })
})

app.post("/upload", (req, res) => {
    proccessed++;
    console.log(proccessed);
    const userinput = req.body;
    let key = Object.keys(userinput);
    let problem = false;
    if (key.length != 11) return res.send("입력된 데이터의 갯수가 정확하지 않습니다.");
    key.some(name => {
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

    const mailText = `합격 과: ${userinput.sub}\n수험번호: ${userinput.testNo}\n이름: ${userinput.name}\n구분: ${userinput.type}\n출금동의일자: ${userinput.AccDay}\n예금주 성명: ${userinput.AccHolderName}\n학부모님 핸드폰번호: ${userinput.ParentPhone}\n계좌번호(농협): ${userinput.AccNo}\n신청인: ${userinput.WhoAreYou}\n예금주와 관계: ${userinput.Relation}\n납부자 번호: ${userinput.PayerNo}`;
    if (mailText.indexOf("undefined") != -1) return res.send("누락된 정보가 있습니다.");

    const mailoption = {
        from: `${config.mailID}@gmail.com`,
        to: config.targetEmail,
        subject: `[${userinput.type}] ${userinput.name}`,
        text: mailText
    }
    transporter.sendMail(mailoption, (err, info) => {
        if (err) console.log(err);
        if (err) return res.send("서버 처리 과정에서 오류가 발생했습니다. 잠시후 다시 시도해 주세요 (11)")
        res.send("정상 처리되었습니다.");
    })
})

app.listen(80, () => {
    console.log("온라인 전자서명 서버 is online on 80 Port");
})