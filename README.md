# Tokyo Chuo Church Site - v2 modules

원본 화면과 기능을 유지하는 것을 목표로 한 2차 구조 분리본입니다.

## 구조

- index.html
- css/style.css
- js/firebase.js: Firebase 초기화 및 로그인
- js/pages.js: SPA 페이지 템플릿
- js/config.js: 게시판/Firebase 게시판 설정
- js/utils.js: 공통 유틸 함수
- js/router.js: navigate, home marquee
- js/board-csv.js: Google Sheets 기반 게시판
- js/board-firestore.js: Firestore 기반 게시판/글쓰기
- js/app.js: 앱 시작 및 공통 이벤트
- assets/images/: 기존 인라인 이미지 분리본
- assets/provided/: 별도 제공받은 로고/목사님 이미지

## 적용 전 확인

기존 사이트는 덮어쓰지 말고 test 폴더에 먼저 업로드해서 메뉴, 게시판, 로그인, 글쓰기 기능을 확인하세요.
