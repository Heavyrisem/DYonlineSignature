# DYonlineSignature
덕영고등학교의 스쿨뱅킹 신청 페이지 입니다.

간단한 프로젝트여서 프론트엔드는 외부 라이브러리나 프레임워크를 사용하지 않았습니다.

처음으로 팀단위로 진행한 프로젝트였습니다.

프론트엔드는 1년 선배와 동갑 친구가 맡았고, 저는 백엔드를 담당했습니다.

## BackEnd
프론트엔드의 디자인이 끝난 후에 파일을 넘겨받아 백엔드 프로그램을 개발하고 웹과 네트워크 연결을 하는 작업을 했습니다.

백엔드는 Node.js를 사용했고 핵심 기능인 사용자의 입력을 정리하여 메일로 전송하는 기능은 nodemailer라이브러리를 사용하여 구현했습니다.

SSL의 적용을 위해 여러 방법을 찾아보았고 greenlock라이브러리를 사용하여 구현했습니다.

프론트엔드의 수정 이후에 깃허브에 커밋을 올리고 다시 서버에서 pull 하고 서비스를 재시작 하는 과정에서 매우 번거로움을 느꼈고, 이를 자동으로 진행해주는 기능을 개발하였습니다.

github의 webhooks기능을 사용하여 구현했습니다.

## 느낀점
주어진 기간이 넉넉하지 않아서 라이브러리를 많이 이용하여 아쉬웠습니다.

다시 돌아보면 많이 부족했던 부분이 있었지만, 이렇게 협업을 하여 개발해보는 것이 많은 도움이 되었다고 생각합니다.