async function loadBoard(boardKey) {
  const config = BOARD_CONFIG[boardKey];
  if (!config) return;

  renderBoardToolbar(boardKey, config);

  const featuredEl = document.getElementById('boardFeatured-' + boardKey);
  const listEl = document.getElementById('boardList-' + boardKey);
  if (!listEl) return;

  try {
    const res = await fetch(csvUrl(config.tab));
    if (!res.ok) throw new Error('시트를 불러오지 못했습니다');
    const text = await res.text();
    const rows = parseCSV(text);

    if (rows.length <= 1) {
      if (featuredEl) featuredEl.innerHTML = '';
      listEl.innerHTML = '<div class="board-empty">등록된 게시물이 없습니다.</div>';
      return;
    }

    const header = rows[0].map(h => h.trim());
    let dataRows = rows.slice(1);

    // 선교지(region) 필터가 설정된 게시판이면 해당 지역 글만 추림
    if (config.region) {
      const regionIdx = header.indexOf('region');
      dataRows = dataRows.filter(r => regionIdx >= 0 && (r[regionIdx] || '').trim() === config.region);
    }

    dataRows = dataRows.reverse(); // 최신순(시트 아래에 추가되는 구조 가정)

    if (dataRows.length === 0) {
      if (featuredEl) featuredEl.innerHTML = '';
      listEl.innerHTML = '<div class="board-empty">등록된 게시물이 없습니다.</div>';
      return;
    }

    const [latest, ...rest] = dataRows;

    if (featuredEl) {
      featuredEl.innerHTML = renderBoardFeatured(boardKey, header, latest);
    }

    listEl.innerHTML = rest.length
      ? rest.map(r => renderBoardRow(boardKey, header, r)).join('')
      : '<div class="board-empty">지난 글이 없습니다.</div>';
  } catch (err) {
    console.error('게시판 로드 실패:', err);
    if (featuredEl) featuredEl.innerHTML = '';
    listEl.innerHTML = '<div class="board-empty">게시물을 불러오는 중 오류가 발생했습니다.</div>';
  }
}

function getBoardFields(header, row) {
  const get = (key) => {
    const idx = header.indexOf(key);
    return idx >= 0 ? (row[idx] || '').trim() : '';
  };
  return {
    date: get('date'),
    title: get('title'),
    verse: get('verse'),
    preacher: get('preacher'),
    content: get('content'),
    youtubeUrl: get('youtube_url'),
    audioUrl: get('audio_url'),
    fileUrl: get('file_url'),
  };
}

function renderBoardFeatured(boardKey, header, row) {
  const f = getBoardFields(header, row);

  const subParts = [];
  if (f.verse) subParts.push(f.verse);
  if (f.preacher) subParts.push(f.preacher);

  const linkUrl = f.youtubeUrl || f.audioUrl || f.fileUrl;
  const linkLabel = f.youtubeUrl ? 'YouTube에서 보기 ▸' : f.audioUrl ? '음성 다시듣기 ▸' : f.fileUrl ? '파일 보기 ▸' : '';

  return `
    <span class="bf-badge">최신글</span>
    <div class="bf-date">${escapeHtml(f.date)}</div>
    <div class="bf-title">${escapeHtml(f.title)}</div>
    ${subParts.length ? `<div class="bf-sub">${escapeHtml(subParts.join(' · '))}</div>` : ''}
    ${f.content ? `<div class="bf-sub">${escapeHtml(f.content)}</div>` : ''}
    ${linkUrl ? `<a class="bf-link" href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener">${linkLabel}</a>` : ''}
  `;
}

function renderBoardRow(boardKey, header, row) {
  const f = getBoardFields(header, row);

  const subParts = [];
  if (f.verse) subParts.push(f.verse);
  if (f.preacher) subParts.push(f.preacher);
  if (f.content) subParts.push(f.content.length > 60 ? f.content.slice(0, 60) + '…' : f.content);

  const linkUrl = f.youtubeUrl || f.audioUrl || f.fileUrl;
  const linkLabel = f.youtubeUrl ? 'YouTube ▸' : f.audioUrl ? '음성듣기 ▸' : f.fileUrl ? '파일보기 ▸' : '';

  return `
    <div class="board-row">
      <span class="b-date">${escapeHtml(f.date)}</span>
      <span class="b-main">
        <div class="b-title">${escapeHtml(f.title)}</div>
        ${subParts.length ? `<div class="b-sub">${escapeHtml(subParts.join(' · '))}</div>` : ''}
      </span>
      ${linkUrl ? `<a class="b-link" href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener">${linkLabel}</a>` : ''}
    </div>
  `;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderBoardToolbar(boardKey, config) {
  const toolbar = document.getElementById('boardToolbar-' + boardKey);
  if (!toolbar) return;

  const role = window.currentRole;
  const canWrite = role && config.roles.includes(role);

  toolbar.innerHTML = canWrite
    ? `<button class="board-write-btn" onclick="openBoardForm('${boardKey}')">글쓰기</button>`
    : '';
}

function openBoardForm(boardKey) {
  const config = BOARD_CONFIG[boardKey];
  if (!config) return;

  if (!config.formUrl) {
    alert('이 게시판의 글쓰기 폼이 아직 연결되지 않았습니다. 관리자에게 문의해 주세요.');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'form-modal-overlay';
  overlay.innerHTML = `
    <div class="form-modal">
      <div class="form-modal-head">
        <strong>글쓰기</strong>
        <button onclick="closeBoardForm()">&times;</button>
      </div>
      <iframe src="${escapeHtml(config.formUrl)}"></iframe>
    </div>
  `;
  overlay.id = 'boardFormOverlay';
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBoardForm(); });
  document.body.appendChild(overlay);
}

function closeBoardForm() {
  const overlay = document.getElementById('boardFormOverlay');
  if (overlay) overlay.remove();
}
window.openBoardForm = openBoardForm;
window.closeBoardForm = closeBoardForm;

window.loadBoard = loadBoard;
window.renderBoardToolbar = renderBoardToolbar;
