import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
  import {
    getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
  import {
    getFirestore, doc, getDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp
  } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
  import {
    getStorage, ref, uploadBytes, getDownloadURL
  } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

  const firebaseConfig = {
    apiKey: "AIzaSyBUoh6OQ5jGVaU0-cMAb8dRARPaW5QEvnM",
    authDomain: "tckwebsite-5f06b.firebaseapp.com",
    projectId: "tckwebsite-5f06b",
    storageBucket: "tckwebsite-5f06b.firebasestorage.app",
    messagingSenderId: "362089786038",
    appId: "1:362089786038:web:46bc29ec2272ec9bb31417",
    measurementId: "G-X2T1JRTD3M"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const provider = new GoogleAuthProvider();

  // 다른 일반 <script> 블록(게시판 로직 등)에서도 쓸 수 있도록 전역으로 노출
  window.fbDb = db;
  window.fbStorage = storage;
  window.fbCollection = collection;
  window.fbAddDoc = addDoc;
  window.fbQuery = query;
  window.fbWhere = where;
  window.fbOrderBy = orderBy;
  window.fbGetDocs = getDocs;
  window.fbServerTimestamp = serverTimestamp;
  window.fbStorageRef = ref;
  window.fbUploadBytes = uploadBytes;
  window.fbGetDownloadURL = getDownloadURL;

  // 다른 일반 <script> 블록(navigate 등)에서도 쓸 수 있도록 전역으로 노출
  window.currentUser = null;   // Firebase Auth user 객체
  window.currentRole = null;   // "super_admin" / "admin" / "member" / null(미로그인 또는 미등록)
  window.currentName = null;

  window.signInWithGoogle = function () {
    signInWithPopup(auth, provider).catch((err) => {
      console.error("로그인 실패:", err);
      alert("로그인에 실패했습니다. 다시 시도해 주세요.");
    });
  };

  window.signOutUser = function () {
    signOut(auth);
  };

  function renderAuthArea() {
    const area = document.getElementById('authArea');
    if (!area) return;

    if (!window.currentUser) {
      area.innerHTML = '<button class="login-btn" id="loginBtn" onclick="signInWithGoogle()">로그인</button>';
      return;
    }

    const photo = window.currentUser.photoURL || '';
    const displayName = window.currentName || window.currentUser.displayName || '회원';
    const roleLabel =
      window.currentRole === 'super_admin' ? '최고관리자' :
      window.currentRole === 'admin'       ? '관리자' :
      window.currentRole === 'member'      ? '일반회원' : '';

    area.innerHTML = `
      ${photo ? `<img class="user-box" src="${photo}" alt="">` : ''}
      <span class="user-name">${displayName}</span>
      ${roleLabel ? `<span class="user-role">${roleLabel}</span>` : ''}
      <button class="logout-btn" onclick="signOutUser()">로그아웃</button>
    `;

    // 레벨에 따라 메뉴/버튼을 보이거나 숨기는 처리는 여기서 이어서 확장
    document.dispatchEvent(new CustomEvent('authReady', {
      detail: { user: window.currentUser, role: window.currentRole }
    }));
  }

  onAuthStateChanged(auth, async (user) => {
    window.currentUser = user;

    if (!user) {
      window.currentRole = null;
      window.currentName = null;
      renderAuthArea();
      return;
    }

    try {
      // users 컬렉션에서 이 사람의 이메일과 일치하는 문서를 이메일을 문서 ID로 가정해 우선 조회
      // (문서 ID를 자동 ID로 만드셨으므로, email 필드 기준으로 조회하는 방식 사용)
      const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
      const q = query(collection(db, "users"), where("email", "==", user.email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data();
        window.currentRole = data.role || 'member';
        window.currentName = data.name || user.displayName;
      } else {
        // Firestore에 등록되지 않은 이메일 → 일반회원으로 취급
        window.currentRole = 'member';
        window.currentName = user.displayName;
      }
    } catch (err) {
      console.error("회원 레벨 조회 실패:", err);
      window.currentRole = 'member';
      window.currentName = user.displayName;
    }

    renderAuthArea();
  });
