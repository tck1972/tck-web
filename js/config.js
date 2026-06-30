var SHEET_ID = '1Bh-V_zhuVyW0okmuTAPey_oGxaAFM7vnIQFrxkbnw6s';

// 게시판별 설정: 시트 탭명, 표시 컬럼, 글쓰기 권한(role), 구글 폼 URL(추후 채워넣기), region(선교지 필터, 선택)
var BOARD_CONFIG = {
  worship:  { tab: 'worship',  cols: ['date','title','verse','preacher','youtube_url'], roles: ['super_admin','admin'], formUrl: '' },
  dawn:     { tab: 'dawn',     cols: ['date','title','verse','audio_url'],               roles: ['super_admin','admin'], formUrl: '' },
  hangul:   { tab: 'hangul',   cols: ['date','title','content','file_url'],              roles: ['super_admin','admin'], formUrl: '' },
  mission:  { tab: 'mission',  cols: ['date','title','content','file_url'],              roles: ['super_admin','admin'], formUrl: '' },
  bulletin: { tab: 'bulletin', cols: ['date','title','content','file_url'],              roles: ['super_admin','admin'], formUrl: '' },

  // 선교편지(mission 탭)를 선교지(region 컬럼)별로 필터링한 게시판들
  mission_kr:       { tab: 'mission', cols: ['date','title','content','file_url'], roles: ['super_admin','admin'], formUrl: '', region: '대한민국' },
  mission_india:    { tab: 'mission', cols: ['date','title','content','file_url'], roles: ['super_admin','admin'], formUrl: '', region: '인도' },
  mission_kyoto:    { tab: 'mission', cols: ['date','title','content','file_url'], roles: ['super_admin','admin'], formUrl: '', region: '교토시온그리스도교회' },
  mission_niigata:  { tab: 'mission', cols: ['date','title','content','file_url'], roles: ['super_admin','admin'], formUrl: '', region: '니이카타교회' },
  mission_kitakami: { tab: 'mission', cols: ['date','title','content','file_url'], roles: ['super_admin','admin'], formUrl: '', region: '北上ベテル伝道所' },
};

// ===== Firestore 기반 게시판 (구글 시트 대신 Firestore에 직접 저장) =====
// 'notice'(알림)부터 시범 적용. posts 컬렉션 안에서 board 필드로 구분해서 저장.
var FS_BOARD_CONFIG = {
  notice: { board: 'notice', roles: ['super_admin','admin'] },
};


window.BOARD_CONFIG = BOARD_CONFIG;
window.FS_BOARD_CONFIG = FS_BOARD_CONFIG;
