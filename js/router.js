function navigate(page) {
  // 클릭된 링크의 포커스를 해제해 드롭다운이 닫히도록 함
  if (document.activeElement) document.activeElement.blur();

  const area = document.getElementById('content-area');
  area.classList.add('fading');
  setTimeout(() => {
    area.innerHTML = PAGES[page] || PAGES.home;
    area.classList.remove('fading');
    window.scrollTo({top:0,behavior:'smooth'});
    if (page === 'home') initMarquee();

    const boardKey = page && page.indexOf('board_') === 0 ? page.replace('board_', '') : page;

    if (boardKey && typeof FS_BOARD_CONFIG !== 'undefined' && FS_BOARD_CONFIG[boardKey]) {
      loadBoardFS(boardKey);
    } else if (page && typeof BOARD_CONFIG !== 'undefined' && BOARD_CONFIG[page]) {
      loadBoard(page);
    } else if (page && page.indexOf('board_') === 0) {
      loadBoard(boardKey);
    }
  }, 180);
}

function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  const unit = '<span class="unit">TOKYO CHUO KYOUKAI · SINCE 1972</span>' +
               '<span class="dot">·</span>' +
               '<span class="unit kr-unit">재일대한기독교회 동경중앙교회</span>' +
               '<span class="dot">·</span>';
  track.innerHTML = unit.repeat(10) + unit.repeat(10);
}


window.navigate = navigate;
window.initMarquee = initMarquee;
