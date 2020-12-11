let isPending = false;

function sendData() {
    if (isPending) return alert("서버 응답 대기중 입니다.");
    const userinput = {
        sub:(document.getElementById("sub").options[document.getElementById("sub").selectedIndex].value),
        testNo:(document.getElementById("testNo").value),
        name:(document.getElementById("name").value),
        type:("스쿨뱅킹 신청"), // type
        AccDay:(document.getElementById("AccDay").value),
        AccHolderName:(document.getElementById("AccHolderName").value),
        ParentPhone:(document.getElementById("ParentPhone").value),
        AccNo:(document.getElementById("AccNo").value),
        WhoAreYou:(document.getElementById("WhoAreYou").value),
        Relation:(document.getElementById("Relation").options[document.getElementById("Relation").selectedIndex].value),
        PayerNo: (document.getElementById("PayerNo").value),
    }
    if (document.getElementById("agreeCheckBox").checked == false) {
        alert('개인정보 이용 동의에 체크해주세요.');
        return true;
    }
    // 데이터 유효성 검증 ===============
    let key = Object.keys(userinput);
    let problem = false;
    let korNames = {
        "sub":'합격 과',
        "testNo":'수험번호',
        "name":'이름',
        "type":'구분',
        "AccDay":'출금동의일자',
        "AccHolderName": '예금주 성명',
        "ParentPhone": '학부모님 핸드폰 번호',
        "AccNo": '계좌번호(농협)',
        "WhoAreYou": '신청인',
        "Relation": '예금주와 관계',
        "PayerNo": '납부자 번호'
    }   

    // =======================================================================
    key.some(name => {
        if (userinput[name] == undefined || userinput[name] == "") {
            alert(`${korNames[name]}(이)가 공백일수 없습니다. \n다시 입력해 주세요`);
            problem = true;
            return true;
        } else {
            return false;
        }
    });
    // =======================================================================
    if (problem) return;

    key.some(name => {
        switch (name) {
            case 'name':
            case 'AccHolderName':
            case 'WhoAreYou':
                if (userinput[name].match(/[^가-힣]/)){
                    problem = true;
                    alert(`${korNames[name]}(은)는 한글만 작성 가능합니다.\n공백이나 특수기호가 있는지 확인하세요.`);
                    return true;
                }
                break;
            case 'testNo':
            case 'ParentPhone':
            case 'AccNo':
            case 'PayerNo':
                if (userinput[name].match(/[^\d]/)){
                    problem = true;
                    alert(`${korNames[name]}(은)는 숫자만 입력 가능합니다.`);
                    return true;
                }
                break;
            case 'PayerNo':
                if (userinput[name] != (undefined || '') && userinput[name].length != 13){
                    problem = true;
                    alert(`${korNames[name]}(이)의 길이가 올바르지 않습니다.`);
                    return true;
                }
                break;
        }
    })
    // ===============================

    if (!problem && !isPending) {
        // console.log("POST DATA", userinput)
        ajaxSend(userinput)
    }
}

function ajaxSend(data) {
    isPending = true;
    data.token = "Ie9mkp6Ty3uqHnd9cY6M7c7qwEA91r";
    let httpRequset;
    httpRequset = new XMLHttpRequest();
    

    if (!httpRequset) {
        alert("XMLHTTP 인스턴스 생성 실패");
        return false;
    }
    httpRequset.onreadystatechange = () => {
        isPending = false;
        if (httpRequset.readyState === XMLHttpRequest.DONE) {
            if (httpRequset.status === 200) {
                alert(httpRequset.response);
                console.log(httpRequset.response);
            } else {
                alert("서버에 요청을 보내는데 실패했습니다.");
            }
        }
    }
    httpRequset.open("POST", "https://dyonlinesignature.kro.kr/upload");
    httpRequset.setRequestHeader("Content-Type", "application/json");
    httpRequset.send(JSON.stringify(data));
}


// 합격 과: ~
// 수험번호: ~
// 이름: ~
// 구분: 스쿨뱅킹 신청
// 출금동의일자: 날짜~
// 예금주 성명: ~
// 학부모님 핸드폰 번호: ~
// 계좌번호(농협): ~
// 신청인: ~
// 예금주와 관계: ~
// 납부자 번호: ~