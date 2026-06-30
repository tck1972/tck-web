async function loadBoardFS(boardKey) {
  const config = FS_BOARD_CONFIG[boardKey];
  if (!config) return;

  renderBoardToolbarFS(boardKey, config);

  const featuredEl = document.getElementById('boardFeatured-' + boardKey);
  const listEl = document.getElementById('boardList-' + boardKey);
  if (!listEl) return;

  if (!window.fbDb) {
    listEl.innerHTML = '<div class="board-empty">게시판을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.</div>';
    return;
  }

  try {
    const q = window.fbQuery(
      window.fbCollection(window.fbDb, 'posts'),
      window.fbWhere('board', '==', config.board),
      window.fbOrderBy('createdAt', 'desc')
    );
    const snap = await window.fbGetDocs(q);
    const posts = snap.docs.map(d => d.data());

    if (posts.length === 0) {
      if (featuredEl) featuredEl.innerHTML = '';
      listEl.innerHTML = '<div class="board-empty">등록된 게시물이 없습니다.</div>';
      return;
    }

    const [latest, ...rest] = posts;

    if (featuredEl) featuredEl.innerHTML = renderBoardFeaturedFS(latest);
    listEl.innerHTML = rest.length
      ? rest.map(p => renderBoardRowFS(p)).join('')
      : '<div class="board-empty">지난 글이 없습니다.</div>';
  } catch (err) {
    console.error('게시판 로드 실패(Firestore):', err);
    if (featuredEl) featuredEl.innerHTML = '';
    listEl.innerHTML = '<div class="board-empty">게시물을 불러오는 중 오류가 발생했습니다.</div>';
  }
}

function renderBoardFeaturedFS(post) {
  return `
    <span class="bf-badge">최신글</span>
    <div class="bf-date">${escapeHtml(post.date || '')}</div>
    <div class="bf-title">${escapeHtml(post.title || '')}</div>
    ${post.content ? `<div class="bf-sub">${escapeHtml(post.content)}</div>` : ''}
    ${post.fileUrl ? `<a class="bf-link" href="${escapeHtml(post.fileUrl)}" target="_blank" rel="noopener">파일 보기 ▸</a>` : ''}
  `;
}

function renderBoardRowFS(post) {
  const contentPreview = post.content
    ? (post.content.length > 60 ? post.content.slice(0, 60) + '…' : post.content)
    : '';
  return `
    <div class="board-row">
      <span class="b-date">${escapeHtml(post.date || '')}</span>
      <span class="b-main">
        <div class="b-title">${escapeHtml(post.title || '')}</div>
        ${contentPreview ? `<div class="b-sub">${escapeHtml(contentPreview)}</div>` : ''}
      </span>
      ${post.fileUrl ? `<a class="b-link" href="${escapeHtml(post.fileUrl)}" target="_blank" rel="noopener">파일보기 ▸</a>` : ''}
    </div>
  `;
}

function renderBoardToolbarFS(boardKey, config) {
  const toolbar = document.getElementById('boardToolbar-' + boardKey);
  if (!toolbar) return;

  const role = window.currentRole;
  const canWrite = role && config.roles.includes(role);

  toolbar.innerHTML = canWrite
    ? `<button class="board-write-btn" onclick="openWriteModal('${boardKey}')">글쓰기</button>`
    : '';
}

function openWriteModal(boardKey) {
  const config = FS_BOARD_CONFIG[boardKey];
  if (!config) return;

  const todayStr = new Date().toISOString().slice(0, 10);

  const overlay = document.createElement('div');
  overlay.className = 'form-modal-overlay';
  overlay.id = 'writeModalOverlay';
  overlay.innerHTML = `
    <div class="form-modal">
      <div class="form-modal-head">
        <strong>글쓰기</strong>
        <button onclick="closeWriteModal()">&times;</button>
      </div>
      <div class="write-modal-body">
        <div class="write-error" id="writeError" style="display:none;"></div>
        <div class="write-field">
          <label>작성일</label>
          <input type="date" id="writeDate" value="${todayStr}">
        </div>
        <div class="write-field">
          <label>제목</label>
          <input type="text" id="writeTitle" placeholder="제목을 입력하세요">
        </div>
        <div class="write-field">
          <label>내용</label>
          <textarea id="writeContent" placeholder="내용을 입력하세요"></textarea>
        </div>
        <div class="write-field">
          <label>첨부파일 (선택)</label>
          <input type="file" id="writeFile">
        </div>
        <button class="write-submit-btn" id="writeSubmitBtn" onclick="submitPost('${boardKey}')">등록하기</button>
      </div>
    </div>
  `;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeWriteModal(); });
  document.body.appendChild(overlay);
}

function closeWriteModal() {
  const overlay = document.getElementById('writeModalOverlay');
  if (overlay) overlay.remove();
}

async function submitPost(boardKey) {
  const config = FS_BOARD_CONFIG[boardKey];
  if (!config) return;

  const errorEl = document.getElementById('writeError');
  const submitBtn = document.getElementById('writeSubmitBtn');
  const date = document.getElementById('writeDate').value;
  const title = document.getElementById('writeTitle').value.trim();
  const content = document.getElementById('writeContent').value.trim();
  const fileInput = document.getElementById('writeFile');
  const file = fileInput && fileInput.files[0];

  if (!title) {
    errorEl.textContent = '제목을 입력해 주세요.';
    errorEl.style.display = 'block';
    return;
  }
  if (!window.currentUser) {
    errorEl.textContent = '로그인이 필요합니다.';
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = '등록 중...';

  try {
    let fileUrl = '';
    if (file) {
      const path = `posts/${config.board}/${Date.now()}_${file.name}`;
      const storageRef = window.fbStorageRef(window.fbStorage, path);
      await window.fbUploadBytes(storageRef, file);
      fileUrl = await window.fbGetDownloadURL(storageRef);
    }

    await window.fbAddDoc(window.fbCollection(window.fbDb, 'posts'), {
      board: config.board,
      date: date,
      title: title,
      content: content,
      fileUrl: fileUrl,
      authorEmail: window.currentUser.email,
      authorName: window.currentName || window.currentUser.displayName || '',
      createdAt: window.fbServerTimestamp(),
    });

    closeWriteModal();
    loadBoardFS(boardKey);
  } catch (err) {
    console.error('게시물 등록 실패:', err);
    errorEl.textContent = '등록 중 오류가 발생했습니다. 다시 시도해 주세요.';
    errorEl.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = '등록하기';
  }
}

window.openWriteModal = openWriteModal;
window.closeWriteModal = closeWriteModal;
window.submitPost = submitPost;

window.loadBoardFS = loadBoardFS;
window.renderBoardToolbarFS = renderBoardToolbarFS;
