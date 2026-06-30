// 앱 시작 및 공통 이벤트 바인딩

// 로그인 상태가 바뀌면(로그인/로그아웃), 현재 보고 있는 게시판이면 글쓰기 버튼도 다시 그림
document.addEventListener('authReady', () => {
  const current = document.querySelector('.board-toolbar[id^="boardToolbar-"]');
  if (current) {
    const key = current.id.replace('boardToolbar-', '');
    if (typeof FS_BOARD_CONFIG !== 'undefined' && FS_BOARD_CONFIG[key]) {
      renderBoardToolbarFS(key, FS_BOARD_CONFIG[key]);
    } else if (typeof BOARD_CONFIG !== 'undefined' && BOARD_CONFIG[key]) {
      renderBoardToolbar(key, BOARD_CONFIG[key]);
    }
  }
});

navigate('home');
