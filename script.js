document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');
  const loginCard = document.querySelector('.container');
  const dashboard = document.querySelector('#projects-panel');
  const logoutButton = document.querySelector('#logout-button');
  const usernameInput = document.querySelector('input[name="username"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const fullNameInput = document.querySelector('input[name="fullname"]');
  const regUsernameInput = document.querySelector('input[name="reg-username"]');
  const regPasswordInput = document.querySelector('input[name="reg-password"]');
  const regConfirmInput = document.querySelector('input[name="reg-confirm"]');
  const loginButton = loginForm?.querySelector('button[type="submit"]');
  const registerButton = registerForm?.querySelector('button[type="submit"]');
  const searchInput = document.querySelector('#dashboard-search');
  const notificationButton = document.querySelector('#notification-button');
  const notificationPanel = document.querySelector('#notification-panel');
  const authTitle = document.querySelector('#auth-title');
  const authSubtitle = document.querySelector('#auth-subtitle');
  const toRegisterWrap = document.querySelector('#to-register-wrap');
  const toLoginWrap = document.querySelector('#to-login-wrap');

  const USER_STORAGE_KEY = 'biokimyo.users';
  const SESSION_STORAGE_KEY = 'biokimyo.session';
  const VIDEO_STORAGE_KEY = 'biokimyo.videos';
  const PDF_STORAGE_KEY = 'biokimyo.pdfs';
  const PROGRESS_STORAGE_KEY = 'biokimyo.progress';
  const NEWS_STORAGE_KEY = 'biokimyo.news';
  const BANNER_STORAGE_KEY = 'biokimyo.banner';
  const ACTIVITY_STORAGE_KEY = 'biokimyo.activity';
  const DEMO_USER = { username: 'biolog', password: 'bio2026', name: 'Biolog', role: 'student' };
  const ADMIN_USER = { username: 'admin', password: 'admin2012', name: 'Owner', role: 'admin' };
  let currentUser = null;
  const fileUrlCache = new Map();

  const isAdminUser = (user) => String(user?.username || '').toLowerCase() === 'admin' || user?.role === 'admin';

  const readUsers = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
      let users = Array.isArray(parsed) ? parsed.filter((user) => user?.username && user?.password) : [];
      let changed = false;
      if (!users.some((user) => String(user.username).toLowerCase() === DEMO_USER.username)) {
        users.unshift({ ...DEMO_USER, createdAt: Date.now() });
        changed = true;
      }
      const adminIndex = users.findIndex((user) => String(user.username).toLowerCase() === ADMIN_USER.username);
      if (adminIndex < 0) {
        users.unshift({ ...ADMIN_USER, createdAt: Date.now() });
        changed = true;
      } else if (users[adminIndex].role !== 'admin') {
        users[adminIndex] = { ...users[adminIndex], role: 'admin' };
        changed = true;
      }
      if (changed) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      return users;
    } catch {
      const users = [{ ...ADMIN_USER, createdAt: Date.now() }, { ...DEMO_USER, createdAt: Date.now() }];
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      return users;
    }
  };

  const saveUsers = (users) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  };

  const saveSession = (user) => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      username: user.username,
      name: user.name,
      role: user.role || (isAdminUser(user) ? 'admin' : 'student'),
      avatar: user.avatar || ''
    }));
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('uz-UZ');
    } catch {
      return '—';
    }
  };

  const readVideos = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(VIDEO_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveVideos = (videos) => {
    localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(videos));
  };

  const readPdfs = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(PDF_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const savePdfs = (pdfs) => {
    localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(pdfs));
  };

  const defaultProgress = () => ({
    streak: 0,
    lastLessonDate: '',
    points: 0,
    units: {},
    watchedVideos: [],
    openedManuals: [],
    badges: [],
    notes: []
  });

  const readAllProgress = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  };

  const progressKey = (user = currentUser) => String(user?.username || '').trim().toLowerCase();

  const getProgressFor = (user) => {
    const key = progressKey(user);
    if (!key) return defaultProgress();
    return { ...defaultProgress(), ...(readAllProgress()[key] || {}) };
  };

  const getProgress = () => getProgressFor(currentUser);

  const saveProgressFor = (user, progress) => {
    const key = progressKey(user);
    if (!key) return;
    const all = readAllProgress();
    all[key] = progress;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(all));
  };

  const saveProgress = (progress) => saveProgressFor(currentUser, progress);

  const deleteProgressFor = (username) => {
    const all = readAllProgress();
    delete all[String(username || '').toLowerCase()];
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(all));
  };

  const readNews = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(NEWS_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveNews = (items) => {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(items));
  };

  const formatDateTime = (value) => {
    if (!value) return 'Hali kirmagan';
    try {
      return new Date(value).toLocaleString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  const readBanner = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(BANNER_STORAGE_KEY) || 'null');
      return parsed && parsed.title ? parsed : null;
    } catch {
      return null;
    }
  };

  const saveBanner = (banner) => {
    if (!banner) localStorage.removeItem(BANNER_STORAGE_KEY);
    else localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(banner));
  };

  const applyBanner = () => {
    const box = document.querySelector('#site-banner');
    const title = document.querySelector('#site-banner-title');
    const text = document.querySelector('#site-banner-text');
    const banner = readBanner();
    if (!box) return;
    if (!banner) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    if (title) title.textContent = banner.title;
    if (text) {
      text.textContent = banner.text || '';
      text.hidden = !banner.text;
    }
  };

  const readActivity = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const logAdmin = (text) => {
    const items = [{ id: `log-${Date.now()}`, text, at: Date.now() }, ...readActivity()].slice(0, 24);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(items));
  };

  const patchUser = (username, patch) => {
    const users = readUsers();
    const key = String(username || '').toLowerCase();
    const index = users.findIndex((user) => String(user.username).toLowerCase() === key);
    if (index < 0) return null;
    users[index] = { ...users[index], ...patch };
    saveUsers(users);
    return users[index];
  };

  const downloadBlob = (filename, text, type) => {
    const blob = new Blob([text], { type: type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const startAutumnLeaves = (dense = true) => {
    const box = document.querySelector('#autumn-leaves');
    if (!box) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = reduce ? 0 : dense ? 26 : 12;
    const kinds = ['maple', 'oak', 'elm'];
    const colors = ['#e85d04', '#dc2f02', '#f48c06', '#faa307', '#9b2226', '#bb3e03', '#d4a373', '#ee9b00'];
    box.innerHTML = Array.from({ length: count }, (_, i) => {
      const left = (i * 17 + Math.random() * 11) % 100;
      const delay = (Math.random() * 14).toFixed(2);
      const duration = (10 + Math.random() * 12).toFixed(2);
      const size = Math.round(16 + Math.random() * 22);
      const sway = Math.round(30 + Math.random() * 90);
      const spin = Math.round(180 + Math.random() * 280);
      return `<span class="leaf leaf-${kinds[i % kinds.length]}" style="--leaf-left:${left}%;--leaf-delay:${delay}s;--leaf-duration:${duration}s;--leaf-size:${size}px;--leaf-color:${colors[i % colors.length]};--leaf-sway:${sway}px;--leaf-spin:${spin}deg"></span>`;
    }).join('');
  };

  const giveBonus = (username, points, reason) => {
    const user = findUser(username);
    const amount = Number(points);
    if (!user || isAdminUser(user) || !Number.isFinite(amount) || !amount) return false;
    const progress = getProgressFor(user);
    progress.points = Math.max(0, (progress.points || 0) + amount);
    unlockBadges(progress);
    pushNote(progress, amount > 0 ? 'Bonus' : 'Ball', reason || `Admin ${amount > 0 ? '+' : ''}${amount} ball`);
    saveProgressFor(user, progress);
    logAdmin(`${user.name || user.username} ga ${amount > 0 ? '+' : ''}${amount} ball`);
    return true;
  };

  const formatPoints = (value) => Number(value || 0).toLocaleString('uz-UZ');

  const displayPoints = (user, points) => isAdminUser(user) ? '∞' : formatPoints(points);

  const rankFromPoints = (points) => {
    if (points >= 2000) return 'Ustoz';
    if (points >= 1000) return 'Bilimdon';
    if (points >= 400) return 'Faol o‘quvchi';
    if (points >= 100) return 'O‘quvchi';
    return 'Yangi';
  };

  const getStudentRanking = () => readUsers()
    .filter((user) => !isAdminUser(user) && !user.blocked)
    .map((user) => ({ user, stats: getProgressFor(user) }))
    .sort((a, b) => {
      const pointGap = (b.stats.points || 0) - (a.stats.points || 0);
      if (pointGap) return pointGap;
      const streakGap = (b.stats.streak || 0) - (a.stats.streak || 0);
      if (streakGap) return streakGap;
      return String(a.user.name || a.user.username).localeCompare(String(b.user.name || b.user.username), 'uz');
    });

  const rankMedal = (index) => ['🥇', '🥈', '🥉'][index] || String(index + 1);

  const rankingRowHtml = (row, index) => {
    const me = String(currentUser?.username || '').toLowerCase() === String(row.user.username).toLowerCase();
    const name = row.user.name || row.user.username;
    const initial = String(name).charAt(0).toUpperCase();
    const photoClass = row.user.avatar ? 'rank-avatar has-photo' : 'rank-avatar';
    const photoStyle = row.user.avatar ? ` style="background-image:url('${row.user.avatar}')"` : '';
    return `
      <article class="rank-row ${index < 3 ? `top-${index + 1}` : ''} ${me ? 'is-me' : ''}">
        <span class="rank-place">${rankMedal(index)}</span>
        <div class="${photoClass}"${photoStyle}>${row.user.avatar ? '' : initial}</div>
        <div class="rank-meta">
          <b>${name}${me ? ' · siz' : ''}</b>
          <small>${rankFromPoints(row.stats.points)} · ${row.stats.streak || 0} kun seriya</small>
        </div>
        <strong>${formatPoints(row.stats.points)} ball</strong>
      </article>
    `;
  };

  const todayKey = () => new Date().toISOString().slice(0, 10);

  const yesterdayKey = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10);
  };

  const markStreak = (progress) => {
    const today = todayKey();
    if (progress.lastLessonDate === today) return progress;
    progress.streak = progress.lastLessonDate === yesterdayKey() ? (progress.streak || 0) + 1 : 1;
    progress.lastLessonDate = today;
    return progress;
  };

  const allBadges = [
    { id: 'first-lesson', icon: '🌱', title: 'Birinchi dars', text: 'Birinchi videoni oxirigacha ko‘rdingiz' },
    { id: 'chem-start', icon: '🧪', title: 'Kimyogar', text: 'Kimyo video darsini ko‘rdingiz' },
    { id: 'streak-7', icon: '🔥', title: '7 kunlik seriya', text: 'Har kuni darsga kirdingiz' },
    { id: 'cell-master', icon: '🧬', title: 'Biolog', text: '3 ta biologiya videosini ko‘rdingiz' },
    { id: 'manual', icon: '📘', title: 'Qo‘llanma', text: 'PDF darslikni ochdingiz' },
    { id: 'points-1000', icon: '⭐', title: '1000 ball', text: '1000 ball to‘pladingiz' },
    { id: 'first-video', icon: '🎬', title: 'Video tomoshabin', text: 'Videoni oxirigacha ko‘rdingiz' },
    { id: 'photo-done', icon: '🎥', title: 'Video ustasi', text: '5 ta videoni oxirigacha ko‘rdingiz' }
  ];

  const earnedBadgeIds = (progress) => {
    const watched = progress.watchedVideos || [];
    const videos = readVideos();
    const bioWatched = videos.filter((item) => item.subject === 'biologiya' && watched.includes(item.id)).length;
    const chemWatched = videos.filter((item) => item.subject === 'kimyo' && watched.includes(item.id)).length;
    const ids = [];
    if (watched.length) {
      ids.push('first-lesson');
      ids.push('first-video');
    }
    if (chemWatched) ids.push('chem-start');
    if ((progress.streak || 0) >= 7) ids.push('streak-7');
    if (bioWatched >= 3) ids.push('cell-master');
    if ((progress.openedManuals || []).length) ids.push('manual');
    if ((progress.points || 0) >= 1000) ids.push('points-1000');
    if (watched.length >= 5) ids.push('photo-done');
    return ids;
  };

  const unlockBadges = (progress) => {
    const next = earnedBadgeIds(progress);
    const prev = progress.badges || [];
    const fresh = next.filter((id) => !prev.includes(id));
    progress.badges = next;
    return fresh;
  };

  const pushNote = (progress, title, text) => {
    progress.notes = [{ title, text, at: Date.now() }, ...(progress.notes || [])].slice(0, 8);
  };

  const applyProgressToCourses = (progress) => {
    const videos = readVideos();
    const watched = new Set(progress.watchedVideos || []);
    courses.forEach((course) => {
      const list = videos.filter((item) => item.subject === course.subject);
      const doneCount = list.filter((item) => watched.has(item.id)).length;
      course.progress = list.length ? Math.round((doneCount / list.length) * 100) : 0;
      course.videoCount = list.length;
      course.watchedCount = doneCount;
    });
  };

  const openMediaDb = () => new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB yo‘q'));
      return;
    }
    const request = indexedDB.open('biokimyo-media', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const saveVideoFile = async (id, file) => {
    const db = await openMediaDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore('files').put(file, id);
    });
    db.close();
  };

  const readVideoFile = async (id) => {
    const db = await openMediaDb();
    const file = await new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const request = tx.objectStore('files').get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return file;
  };

  const deleteVideoFile = async (id) => {
    try {
      const db = await openMediaDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore('files').delete(id);
      });
      db.close();
    } catch {
      /* ignore */
    }
    if (fileUrlCache.has(id)) {
      URL.revokeObjectURL(fileUrlCache.get(id));
      fileUrlCache.delete(id);
    }
  };

  const getFileVideoUrl = async (id) => {
    if (fileUrlCache.has(id)) return fileUrlCache.get(id);
    const file = await readVideoFile(id);
    if (!file) return '';
    const url = URL.createObjectURL(file);
    fileUrlCache.set(id, url);
    return url;
  };

  const compressAvatar = (file) => new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#21a366';
      ctx.fillRect(0, 0, size, size);
      const min = Math.min(img.width, img.height) || 1;
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Rasm ochilmadi'));
    };
    img.src = url;
  });

  const paintAvatar = (el, user, fallback = '') => {
    if (!el) return;
    const name = user?.name || user?.username || fallback || '?';
    if (user?.avatar) {
      el.classList.add('has-photo');
      el.style.backgroundImage = `url("${user.avatar}")`;
      el.textContent = '';
    } else {
      el.classList.remove('has-photo');
      el.style.backgroundImage = '';
      el.textContent = String(name).charAt(0).toUpperCase();
    }
  };

  const youtubeId = (url) => {
    const match = String(url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : '';
  };

  const videoPlayerHtml = (video, src = '') => {
    const yt = youtubeId(video.url);
    if (yt) {
      return `<iframe src="https://www.youtube.com/embed/${yt}" title="${video.title}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
    }
    if (src || video.url) {
      return `<video controls preload="metadata" src="${src || video.url}" data-watch-video="${video.id}"></video>`;
    }
    return '<div style="display:grid;place-items:center;height:100%;color:#9fd3ab;">Video topilmadi</div>';
  };

  const subjectLabel = (id) => ({
    biologiya: 'Biologiya',
    kimyo: 'Kimyo'
  }[id] || id);

  const readSession = () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  };

  const findUser = (username) => {
    const login = String(username || '').trim().toLowerCase();
    return readUsers().find((user) => String(user.username).toLowerCase() === login);
  };

  const fillSettings = () => {
    if (!currentUser) return;
    const name = currentUser.name || currentUser.username;
    const nameEl = document.querySelector('#settings-name');
    const loginEl = document.querySelector('#settings-login');
    const rankEl = document.querySelector('#settings-rank');
    const nameInput = document.querySelector('input[name="settings-name"]');
    const removeBtn = document.querySelector('#settings-avatar-remove');
    const adminRemove = document.querySelector('#admin-avatar-remove');
    paintAvatar(document.querySelector('#settings-avatar'), currentUser);
    paintAvatar(document.querySelector('#admin-settings-avatar'), currentUser, 'A');
    if (nameEl) nameEl.textContent = name;
    if (loginEl) loginEl.textContent = `@${currentUser.username}`;
    if (rankEl) {
      rankEl.textContent = isAdminUser(currentUser)
        ? 'Reyting: Owner · ∞'
        : `Reyting: ${rankFromPoints(getProgress().points)}`;
    }
    if (nameInput) nameInput.value = name;
    if (removeBtn) removeBtn.hidden = !currentUser.avatar;
    if (adminRemove) adminRemove.hidden = !currentUser.avatar;
  };

  const applyUserToUi = (user) => {
    currentUser = user;
    const name = user.name || user.username;
    const nameLabel = document.querySelector('#user-name');
    const welcome = document.querySelector('#welcome-title');
    paintAvatar(document.querySelector('#user-avatar'), user);
    paintAvatar(document.querySelector('#admin-chip-avatar'), user, 'A');
    paintAvatar(document.querySelector('#admin-settings-avatar'), user, 'A');
    if (nameLabel) nameLabel.textContent = name;
    if (welcome) welcome.textContent = `Salom, ${name}! 👋`;
    fillSettings();
    renderStats();
  };

  const updateCurrentUser = (patch) => {
    if (!currentUser) return null;
    const users = readUsers();
    const key = String(currentUser.username).toLowerCase();
    const index = users.findIndex((user) => String(user.username).toLowerCase() === key);
    if (index < 0) return null;
    users[index] = { ...users[index], ...patch };
    saveUsers(users);
    applyUserToUi(users[index]);
    saveSession(users[index]);
    return users[index];
  };

  const courses = [
    {
      id: 'bio-video',
      subject: 'biologiya',
      kind: 'biology',
      icon: '🧬',
      tag: 'Biologiya · Video dars',
      title: 'Biologiya video dars',
      progress: 0,
      videoCount: 0,
      watchedCount: 0
    },
    {
      id: 'chem-video',
      subject: 'kimyo',
      kind: 'chemistry',
      icon: '🧪',
      tag: 'Kimyo · Video dars',
      title: 'Kimyo video dars',
      progress: 0,
      videoCount: 0,
      watchedCount: 0
    }
  ];

  const subjects = [
    { id: 'biologiya', icon: '🧬', title: 'Biologiya', text: 'Biologiya video darslari' },
    { id: 'kimyo', icon: '🧪', title: 'Kimyo', text: 'Kimyo video darslari' }
  ];

  let activeCourseId = 'bio-video';
  let activeUnit = 0;
  let selectedSubject = '';

  const adminPanel = document.querySelector('#admin-panel');
  const adminReturn = document.querySelector('#admin-return');

  const showLogin = () => {
    if (loginCard) loginCard.hidden = false;
    if (dashboard) dashboard.hidden = true;
    if (adminPanel) adminPanel.hidden = true;
    if (adminReturn) adminReturn.hidden = true;
    document.body.classList.remove('logged-in', 'admin-mode');
    startAutumnLeaves(true);
  };

  const showDashboard = () => {
    if (loginCard) loginCard.hidden = true;
    if (dashboard) dashboard.hidden = false;
    if (adminPanel) adminPanel.hidden = true;
    document.body.classList.add('logged-in');
    document.body.classList.remove('admin-mode');
    if (adminReturn) adminReturn.hidden = !isAdminUser(currentUser);
    applyProgressToCourses(getProgress());
    startAutumnLeaves(false);
    openView('home');
    renderAll();
    renderStats();
  };

  const showAdmin = () => {
    if (loginCard) loginCard.hidden = true;
    if (dashboard) dashboard.hidden = true;
    if (adminPanel) adminPanel.hidden = false;
    if (adminReturn) adminReturn.hidden = true;
    document.body.classList.add('logged-in', 'admin-mode');
    startAutumnLeaves(false);
    openAdminView('overview');
    renderAdmin();
  };

  const openView = (name) => {
    document.querySelectorAll('.dash-view').forEach((view) => {
      view.hidden = view.id !== `view-${name}`;
    });
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.view === name);
    });
    if (notificationPanel) notificationPanel.hidden = true;
    if (name === 'settings') fillSettings();
    if (name === 'ranking' || name === 'home' || name === 'achievements') renderStudentRanking();
  };

  const setStatText = (id, value) => {
    const el = document.querySelector(id);
    if (el) el.textContent = value;
  };

  const renderStudentRanking = () => {
    const ranked = getStudentRanking();
    const empty = '<p class="video-empty">Hali o‘quvchi reytingi yo‘q. Ro‘yxatdan o‘tganlar ball to‘plagach shu yerda chiqadi.</p>';
    const home = document.querySelector('#home-ranking');
    const list = document.querySelector('#rank-list');
    const podium = document.querySelector('#rank-podium');
    const ownerCard = document.querySelector('#owner-rank-card');
    const banner = document.querySelector('#your-rank-banner');
    const title = document.querySelector('#your-rank-title');
    const text = document.querySelector('#your-rank-text');
    const placeEl = document.querySelector('#your-rank-place');
    const meKey = String(currentUser?.username || '').toLowerCase();
    const myIndex = ranked.findIndex((row) => String(row.user.username).toLowerCase() === meKey);
    const adminView = isAdminUser(currentUser);

    if (home) home.innerHTML = ranked.slice(0, 5).map((row, index) => rankingRowHtml(row, index)).join('') || empty;
    if (list) list.innerHTML = ranked.map((row, index) => rankingRowHtml(row, index)).join('') || empty;

    if (podium) {
      const slots = [
        ranked[0] && { row: ranked[0], place: 1, cls: 'gold' },
        ranked[1] && { row: ranked[1], place: 2, cls: 'silver' },
        ranked[2] && { row: ranked[2], place: 3, cls: 'bronze' }
      ].filter(Boolean);
      podium.hidden = !slots.length;
      podium.innerHTML = slots.map((item) => {
        const name = item.row.user.name || item.row.user.username;
        const initial = String(name).charAt(0).toUpperCase();
        const me = String(item.row.user.username).toLowerCase() === meKey;
        const photoClass = item.row.user.avatar ? 'rank-avatar has-photo' : 'rank-avatar';
        const photoStyle = item.row.user.avatar ? ` style="background-image:url('${item.row.user.avatar}')"` : '';
        return `
          <article class="podium-card ${item.cls}${me ? ' is-me' : ''}">
            <span>${rankMedal(item.place - 1)}</span>
            <div class="${photoClass}"${photoStyle}>${item.row.user.avatar ? '' : initial}</div>
            <b>${name}${me ? ' · siz' : ''}</b>
            <strong>${formatPoints(item.row.stats.points)}</strong>
            <small>${rankFromPoints(item.row.stats.points)}</small>
          </article>
        `;
      }).join('');
    }

    if (ownerCard) ownerCard.classList.toggle('is-me', adminView);
    if (banner) banner.classList.toggle('is-owner', adminView);
    if (adminView) {
      if (title) title.textContent = 'Owner / Admin';
      if (text) text.textContent = 'Ballaringiz cheksiz, lekin o‘quvchilar reytingida 1-o‘rin emassiz';
      if (placeEl) placeEl.textContent = '∞';
      setStatText('#stat-place', '🏅 Owner');
      setStatText('#ach-place', '🏅 Owner');
    } else if (myIndex >= 0) {
      const mine = ranked[myIndex];
      if (title) title.textContent = 'Sizning o‘rningiz';
      if (text) text.textContent = `${formatPoints(mine.stats.points)} ball · ${rankFromPoints(mine.stats.points)}`;
      if (placeEl) placeEl.textContent = `${myIndex + 1}-o‘rin`;
      setStatText('#stat-place', `🏅 ${myIndex + 1}-o‘rin`);
      setStatText('#ach-place', `🏅 ${myIndex + 1}-o‘rin`);
    } else {
      if (title) title.textContent = 'Sizning o‘rningiz';
      if (text) text.textContent = 'Ball to‘plang va 1-o‘ringa chiqing';
      if (placeEl) placeEl.textContent = '—';
      setStatText('#stat-place', '🏅 —');
      setStatText('#ach-place', '🏅 —');
    }
  };

  const renderStats = () => {
    const progress = getProgress();
    const adminView = isAdminUser(currentUser);
    const rank = adminView ? 'Owner' : rankFromPoints(progress.points);
    const badges = (progress.badges || []).length;
    const pointsLabel = adminView ? '∞' : formatPoints(progress.points);
    setStatText('#stat-streak', `🔥 ${progress.streak || 0} kun`);
    setStatText('#stat-points', `⭐ ${pointsLabel}`);
    setStatText('#stat-badges', `🏆 ${badges}`);
    setStatText('#stat-rank', `🎯 ${rank}`);
    setStatText('#ach-streak', `🔥 ${progress.streak || 0} kun`);
    setStatText('#ach-points', `⭐ ${pointsLabel}`);
    setStatText('#ach-badges', `🏆 ${badges}`);
    setStatText('#ach-rank', `🎯 ${rank}`);
    const rankLabel = document.querySelector('#user-rank');
    if (rankLabel) rankLabel.textContent = adminView ? 'Reyting: Owner · ∞' : `Reyting: ${rank}`;
    const settingsRank = document.querySelector('#settings-rank');
    if (settingsRank) settingsRank.textContent = adminView ? 'Reyting: Owner · ∞' : `Reyting: ${rank}`;
    const welcomeText = document.querySelector('#welcome-text');
    if (welcomeText) {
      welcomeText.textContent = adminView
        ? 'Siz Owner siz. Ballaringiz cheksiz, lekin o‘quvchilar reytingida 1-o‘rin emassiz.'
        : progress.points
          ? `Reytingingiz — ${rank}. Ballaringiz o‘sib bormoqda, biologiya va kimyo videolarini davom ettiring.`
          : 'Biologiya va kimyo video darslarini 0 dan boshlang. Oxirigacha ko‘rsangiz ball oshadi.';
    }
    renderStudentRanking();
    renderAchievements();
    renderNotifications();
  };

  const renderAchievements = () => {
    const box = document.querySelector('#badge-grid');
    if (!box) return;
    const progress = getProgress();
    const earned = new Set(earnedBadgeIds(progress));
    box.innerHTML = allBadges.map((badge) => `
      <article class="${earned.has(badge.id) ? 'earned' : 'locked'}">
        <b>${badge.icon}</b>
        <h3>${badge.title}</h3>
        <p>${badge.text}</p>
      </article>
    `).join('');
  };

  const renderNotifications = () => {
    if (!notificationPanel) return;
    const progress = getProgress();
    const news = readNews().slice(0, 4).map((item) => `
      <p><b>${item.title}</b> ${item.text}</p>
    `);
    const notes = (progress.notes || []).slice(0, 4).map((item) => `
      <p><b>${item.title}</b> ${item.text}</p>
    `);
    const items = [...news, ...notes];
    notificationPanel.innerHTML = items.join('') || '<p><b>Hozircha yangilik yo‘q</b> Dars qilsangiz ball va yutuqlar shu yerda chiqadi.</p>';
    const dot = document.querySelector('#notification-button i');
    if (dot) dot.hidden = items.length === 0;
  };

  const commitProgress = (progress, note) => {
    const fresh = unlockBadges(progress);
    if (note) pushNote(progress, note.title, note.text);
    fresh.forEach((id) => {
      const badge = allBadges.find((item) => item.id === id);
      if (badge) pushNote(progress, 'Yutuq', `${badge.title} ochildi`);
    });
    saveProgress(progress);
    applyProgressToCourses(progress);
    renderStats();
  };

  const courseCard = (course, compact = false) => `
    <article class="course-card ${course.kind}-card" data-open-course="${course.id}">
      <div class="course-icon">${course.icon}</div>
      <div class="course-info">
        <span>${course.tag}</span>
        <h3>${course.title}</h3>
        <div class="progress-line"><i style="width:${course.progress}%"></i></div>
        <small>${course.progress}% · ${course.watchedCount || 0}/${course.videoCount || 0} video</small>
      </div>
      ${compact ? `<button class="course-play" type="button" data-open-course="${course.id}">▶</button>` : ''}
    </article>
  `;

  const libraryCard = (course) => `
    <article class="library-card ${course.kind}" data-open-course="${course.id}">
      <div class="library-cover">${course.icon}</div>
      <div class="library-body">
        <span>${course.tag}</span>
        <h3>${course.title}</h3>
        <div class="progress-line"><i style="width:${course.progress}%"></i></div>
        <small>${course.progress}% · ${course.watchedCount || 0}/${course.videoCount || 0} video</small>
        <button type="button" data-open-course="${course.id}">Videolarni ochish</button>
      </div>
    </article>
  `;

  const subjectCard = (subject) => `
    <article data-open-subject="${subject.id}">
      <b>${subject.icon}</b>
      <div>
        <h3>${subject.title}</h3>
        <p>${subject.text}</p>
      </div>
      <span>→</span>
    </article>
  `;

  const filteredCourses = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    return courses.filter((course) => {
      const haystack = `${course.title} ${course.tag} ${course.subject}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesSubject = !selectedSubject || course.subject === selectedSubject;
      return matchesQuery && matchesSubject;
    });
  };

  const renderAll = () => {
    applyProgressToCourses(getProgress());
    const homeCourses = document.querySelector('#home-courses');
    const allCourses = document.querySelector('#all-courses');
    const homeSubjects = document.querySelector('#home-subjects');
    const allSubjects = document.querySelector('#all-subjects');
    const subjectCourses = document.querySelector('#subject-courses');
    if (homeCourses) {
      homeCourses.innerHTML = courses.map((course) => courseCard(course, true)).join('');
    }
    if (allCourses) {
      allCourses.innerHTML = courses.filter((course) => {
        const query = (searchInput?.value || '').trim().toLowerCase();
        return !query || `${course.title} ${course.tag}`.toLowerCase().includes(query);
      }).map(libraryCard).join('') || '<p class="empty-search">Mos kurs topilmadi.</p>';
    }
    if (homeSubjects) homeSubjects.innerHTML = subjects.map(subjectCard).join('');
    if (allSubjects) allSubjects.innerHTML = subjects.map(subjectCard).join('');
    renderStudentVideos();
    renderStudentManuals();
    applyBanner();
    renderStats();
  };

  const manualCard = (manual) => `
    <article class="manual-card">
      <b>PDF</b>
      <div>
        <h4>${manual.title}</h4>
        <p>${subjectLabel(manual.subject)} · ${formatDate(manual.createdAt)}</p>
      </div>
      <div class="manual-actions">
        <button type="button" data-open-manual="${manual.id}" data-manual-subject="${manual.subject || ''}">O‘qish</button>
        <button type="button" data-download-manual="${manual.id}" data-manual-subject="${manual.subject || ''}">Yuklab olish</button>
      </div>
    </article>
  `;

  const renderStudentManuals = () => {
    const uploaded = readPdfs();
    const query = (searchInput?.value || '').trim().toLowerCase();
    const matches = (manual) => !query || `${manual.title} ${manual.subject}`.toLowerCase().includes(query);
    const forSubject = (subject) => uploaded.filter((item) => item.subject === subject).filter(matches);
    const fill = (id, subject, emptyText) => {
      const box = document.querySelector(id);
      if (!box) return;
      const list = forSubject(subject);
      box.innerHTML = list.map(manualCard).join('') || `<p class="video-empty">${emptyText}</p>`;
    };
    fill('#biology-manuals', 'biologiya', 'Hali biologiya qo‘llanmasi yo‘q. Admin PDF joylaydi.');
    fill('#chemistry-manuals', 'kimyo', 'Hali kimyo qo‘llanmasi yo‘q. Admin PDF joylaydi.');
    const home = document.querySelector('#home-manuals');
    const homeWrap = document.querySelector('#home-manuals-wrap');
    if (home) home.innerHTML = uploaded.slice(0, 4).map(manualCard).join('');
    if (homeWrap) homeWrap.hidden = uploaded.length === 0;
  };

  const getManualFile = async (id) => {
    const item = readPdfs().find((pdf) => pdf.id === id);
    if (!item) return null;
    const url = await getFileVideoUrl(item.id);
    if (!url) return null;
    return { url, title: item.title, fileName: `${item.title}.pdf` };
  };

  const openPdfModal = async (id, subject) => {
    const file = await getManualFile(id, subject);
    if (!file) return;
    const modal = document.querySelector('#pdf-modal');
    const frame = document.querySelector('#pdf-frame');
    const title = document.querySelector('#pdf-modal-title');
    const download = document.querySelector('#pdf-download');
    if (title) title.textContent = file.title;
    if (frame) {
      frame.src = `${file.url}#toolbar=1&navpanes=0`;
    }
    if (download) {
      download.href = file.url;
      download.download = file.fileName;
    }
    if (modal) modal.hidden = false;
    if (!isAdminUser(currentUser) && id) {
      const progress = getProgress();
      if (!(progress.openedManuals || []).includes(id)) {
        progress.openedManuals = [...(progress.openedManuals || []), id];
        progress.points += 20;
        markStreak(progress);
        commitProgress(progress, { title: 'Qo‘llanma', text: 'PDF onlayn ochildi. +20 ball' });
      }
    }
  };

  const downloadManual = async (id, subject) => {
    const file = await getManualFile(id, subject);
    if (!file) return;
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.fileName;
    document.body.append(link);
    link.click();
    link.remove();
  };

  const closePdfModal = () => {
    const modal = document.querySelector('#pdf-modal');
    const frame = document.querySelector('#pdf-frame');
    if (frame) frame.src = '';
    if (modal) modal.hidden = true;
  };

  const videoCard = (video, src = '') => {
    const watched = (getProgress().watchedVideos || []).includes(video.id);
    return `
    <article class="video-card ${watched ? 'watched' : ''}">
      <div class="video-frame">${videoPlayerHtml(video, src)}</div>
      <h3>${video.title}</h3>
      <p>${subjectLabel(video.subject)} · ${formatDate(video.createdAt)}</p>
      <div class="watch-hint">${watched ? '✓ Oxirigacha ko‘rilgan · +80 ball' : 'Oxirigacha ko‘rsangiz +80 ball'}</div>
    </article>
  `;
  };

  const bindVideoWatch = (root) => {
    root?.querySelectorAll('video[data-watch-video]').forEach((player) => {
      player.addEventListener('ended', () => awardVideoWatch(player.dataset.watchVideo));
    });
  };

  const awardVideoWatch = (id) => {
    if (!id || isAdminUser(currentUser)) return;
    const progress = getProgress();
    if ((progress.watchedVideos || []).includes(id)) return;
    progress.watchedVideos = [...(progress.watchedVideos || []), id];
    progress.points += 80;
    markStreak(progress);
    commitProgress(progress, { title: 'Video', text: 'Videoni oxirigacha ko‘rdingiz. +80 ball' });
    renderStudentVideos();
  };

  const fillVideoBox = (id, html, emptyText) => {
    const box = document.querySelector(id);
    if (!box) return;
    box.innerHTML = html || `<p class="video-empty">${emptyText}</p>`;
    bindVideoWatch(box);
  };

  const renderStudentVideos = async () => {
    const videos = readVideos();
    const homeWrap = document.querySelector('#home-videos-wrap');
    const homeVideos = document.querySelector('#home-videos');
    const query = (searchInput?.value || '').trim().toLowerCase();
    const visible = videos.filter((video) => {
      const haystack = `${video.title} ${video.subject}`.toLowerCase();
      return !query || haystack.includes(query);
    });
    const bySubject = (subject) => visible.filter((video) => video.subject === subject);

    const cardsFor = async (list) => Promise.all(list.map(async (video) => {
      const src = video.type === 'file' ? await getFileVideoUrl(video.id) : '';
      return videoCard(video, src);
    }));

    if (homeWrap) homeWrap.hidden = videos.length === 0;
    if (homeVideos) {
      homeVideos.innerHTML = (await cardsFor(videos.slice(0, 2))).join('');
      bindVideoWatch(homeVideos);
    }

    const bioHtml = (await cardsFor(bySubject('biologiya'))).join('');
    const chemHtml = (await cardsFor(bySubject('kimyo'))).join('');
    fillVideoBox('#biology-videos', bioHtml, 'Hali biologiya videosi yo‘q. Admin panel orqali joylanadi.');
    fillVideoBox('#chemistry-videos', chemHtml, 'Hali kimyo videosi yo‘q. Admin panel orqali joylanadi.');
    fillVideoBox('#biology-subject-videos', bioHtml, 'Biologiya video darslari shu yerda chiqadi.');
    fillVideoBox('#chemistry-subject-videos', chemHtml, 'Kimyo video darslari shu yerda chiqadi.');

    const course = courses.find((item) => item.id === activeCourseId) || courses[0];
    const title = document.querySelector('#course-videos-title');
    const text = document.querySelector('#course-videos-text');
    if (title) title.textContent = course?.title || 'Video dars';
    if (text) {
      const count = course?.videoCount || 0;
      const done = course?.watchedCount || 0;
      text.textContent = count
        ? `${done}/${count} video ko‘rilgan · oxirigacha ko‘rsangiz +80 ball`
        : 'Hali video yo‘q. Admin panel orqali joylanadi.';
    }
    const courseHtml = course?.subject === 'kimyo' ? chemHtml : bioHtml;
    fillVideoBox(
      '#course-videos',
      courseHtml,
      course?.subject === 'kimyo'
        ? 'Hali kimyo videosi yo‘q. Admin panel orqali joylanadi.'
        : 'Hali biologiya videosi yo‘q. Admin panel orqali joylanadi.'
    );
  };

  const openCourse = (id) => {
    const course = courses.find((item) => item.id === id);
    if (!course) return;
    activeCourseId = id;
    selectedSubject = course.subject;
    applyProgressToCourses(getProgress());
    openView('course-videos');
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.view === 'courses');
    });
    renderStudentVideos();
  };

  const openSubject = (id) => {
    const course = courses.find((item) => item.subject === id);
    if (course) {
      openCourse(course.id);
      return;
    }
    selectedSubject = id;
    openView('subjects');
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.view === 'subjects');
    });
    renderAll();
  };

  const renderLesson = () => {
    const course = courses.find((item) => item.id === activeCourseId);
    const unit = course?.units?.[activeUnit];
    const unitsBox = document.querySelector('#lesson-units');
    const quizBox = document.querySelector('#lesson-quiz');
    if (!course || !unit || !unitsBox) return;

    document.querySelector('#lesson-tag').textContent = course.tag;
    document.querySelector('#lesson-title').textContent = unit.title;
    document.querySelector('#lesson-text').textContent = unit.text;
    document.querySelector('#lesson-facts').innerHTML = unit.facts.map((fact) => `<li>${fact}</li>`).join('');

    unitsBox.innerHTML = course.units.map((item, index) => `
      <button type="button" class="${index === activeUnit ? 'active' : ''}" data-unit="${index}">
        ${item.done ? '✓' : index + 1}. ${item.title}
      </button>
    `).join('');

    if (unit.quiz && quizBox) {
      quizBox.hidden = false;
      quizBox.innerHTML = `
        <h3>${unit.quiz.question}</h3>
        ${unit.quiz.options.map((option, index) => `
          <label data-quiz-option="${index}">
            <input type="radio" name="lesson-quiz" value="${index}"> ${option}
          </label>
        `).join('')}
      `;
    } else if (quizBox) {
      quizBox.hidden = true;
      quizBox.innerHTML = '';
    }
  };

  const completeUnit = () => {
    const course = courses.find((item) => item.id === activeCourseId);
    const unit = course?.units?.[activeUnit];
    if (!course || !unit) return;

    if (unit.quiz) {
      const quizBox = document.querySelector('#lesson-quiz');
      const selected = document.querySelector('input[name="lesson-quiz"]:checked');
      const labels = document.querySelectorAll('#lesson-quiz label');
      labels.forEach((label) => label.classList.remove('correct', 'wrong'));
      if (!selected) {
        if (quizBox && !quizBox.querySelector('.quiz-hint')) {
          const hint = document.createElement('small');
          hint.className = 'quiz-hint';
          hint.textContent = 'Avval javobni tanlang.';
          quizBox.append(hint);
        }
        return;
      }
      const index = Number(selected.value);
      if (index !== unit.quiz.answer) {
        labels[index]?.classList.add('wrong');
        labels[unit.quiz.answer]?.classList.add('correct');
        return;
      }
      labels[index]?.classList.add('correct');
    }

    const progress = getProgress();
    const doneList = progress.units[course.id] ? [...progress.units[course.id]] : [];
    const already = doneList.includes(activeUnit);
    if (!already) {
      doneList.push(activeUnit);
      progress.units[course.id] = doneList;
      progress.points += unit.quiz ? 80 : 50;
      markStreak(progress);
      if (doneList.length === course.units.length) progress.points += 150;
      commitProgress(progress, {
        title: 'Dars',
        text: already ? '' : `${unit.title} tugadi. +${unit.quiz ? 80 : 50} ball`
      });
    }

    unit.done = true;
    const doneCount = course.units.filter((item) => item.done).length;
    course.progress = Math.round((doneCount / course.units.length) * 100);
    if (activeUnit < course.units.length - 1) {
      activeUnit += 1;
      renderLesson();
    } else {
      openView('courses');
      renderAll();
    }
  };

  const attachPasswordToggle = (input) => {
    if (!input?.parentElement || input.parentElement.querySelector('.password-toggle')) return;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'password-toggle';
    toggle.textContent = 'Ko‘rsatish';
    toggle.setAttribute('aria-label', 'Parolni ko‘rsatish');
    input.parentElement.append(toggle);
    toggle.addEventListener('click', () => {
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      toggle.textContent = hidden ? 'Yashirish' : 'Ko‘rsatish';
    });
  };

  const attachFormMessage = (form) => {
    const message = document.createElement('div');
    message.className = 'form-message';
    message.hidden = true;
    form.append(message);
    return message;
  };

  const showFormError = (form, messageEl, text, inputs = []) => {
    messageEl.classList.remove('success');
    messageEl.hidden = false;
    messageEl.textContent = text;
    inputs.forEach((input) => input?.classList.add('input-invalid'));
    form.classList.remove('form-shake');
    void form.offsetWidth;
    form.classList.add('form-shake');
  };

  const showAuthMode = (mode) => {
    const isLogin = mode === 'login';
    if (loginForm) loginForm.hidden = !isLogin;
    if (registerForm) registerForm.hidden = isLogin;
    if (toRegisterWrap) toRegisterWrap.hidden = !isLogin;
    if (toLoginWrap) toLoginWrap.hidden = isLogin;
    if (authTitle) authTitle.textContent = isLogin ? 'Biologiya' : 'Ro‘yxatdan o‘tish';
    if (authSubtitle) {
      authSubtitle.textContent = isLogin
        ? 'Kitoblar • Darslar • Milliy Sertifikat'
        : 'Yangi hisob yarating va darslarni boshlang';
    }
  };

  const enterAccount = (user) => {
    const live = patchUser(user.username, { lastLogin: Date.now() }) || user;
    applyUserToUi(live);
    saveSession(live);
    applyProgressToCourses(getProgress());
    if (isAdminUser(live)) showAdmin();
    else showDashboard();
  };

  const openAdminView = (name) => {
    document.querySelectorAll('.admin-view').forEach((view) => {
      view.hidden = view.id !== `admin-view-${name}`;
    });
    document.querySelectorAll('.admin-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.adminView === name);
    });
    const titles = {
      overview: 'Boshqaruv paneli',
      users: 'Foydalanuvchilar',
      videos: 'Video joylash',
      manuals: 'PDF qo‘llanmalar',
      ranking: 'O‘quvchilar reytingi',
      news: 'Xabarlar',
      analytics: 'Analitika',
      tools: 'Vositalar',
      settings: 'Sozlamalar'
    };
    const heading = document.querySelector('#admin-heading');
    if (heading) heading.textContent = titles[name] || 'Admin panel';
    if (name === 'settings') fillSettings();
  };

  const setAdminMessage = (el, text, ok = false) => {
    if (!el) return;
    el.hidden = !text;
    el.textContent = text;
    el.classList.toggle('success', ok);
  };

  const renderAdmin = async () => {
    const users = readUsers();
    const videos = readVideos();
    const students = users.filter((user) => !isAdminUser(user));
    const setText = (id, value) => {
      const el = document.querySelector(id);
      if (el) el.textContent = value;
    };
    const studentProgress = students.map((user) => getProgressFor(user));
    const totalPoints = studentProgress.reduce((sum, item) => sum + (item.points || 0), 0);
    const totalWatched = studentProgress.reduce((sum, item) => sum + (item.watchedVideos || []).length, 0);
    const today = todayKey();
    const activeToday = studentProgress.filter((item) => item.lastLessonDate === today).length;
    const avgPoints = students.length ? Math.round(totalPoints / students.length) : 0;
    const leader = students
      .map((user) => ({ user, stats: getProgressFor(user) }))
      .sort((a, b) => (b.stats.points || 0) - (a.stats.points || 0))[0];
    const blockedCount = students.filter((user) => user.blocked).length;
    const completedAny = students.filter((user) => {
      const watched = getProgressFor(user).watchedVideos || [];
      return courses.some((course) => {
        const list = videos.filter((item) => item.subject === course.subject);
        return list.length && list.every((item) => watched.includes(item.id));
      });
    }).length;
    setText('#stat-students', students.length);
    setText('#stat-accounts', users.length);
    setText('#stat-videos', videos.length);
    setText('#stat-courses', courses.length);
    setText('#stat-manuals', readPdfs().length);
    setText('#stat-points-all', formatPoints(totalPoints));
    setText('#stat-watched', totalWatched);
    setText('#stat-active-today', activeToday);
    setText('#stat-avg-points', formatPoints(avgPoints));
    setText('#stat-leader', leader ? (leader.user.name || leader.user.username) : '—');
    setText('#an-active', activeToday);
    setText('#an-avg', formatPoints(avgPoints));
    setText('#an-complete', completedAny);
    setText('#an-blocked', blockedCount);

    const recentUsers = document.querySelector('#admin-recent-users');
    if (recentUsers) {
      recentUsers.innerHTML = students.slice(-5).reverse().map((user) => `
        <article><b>${user.name || user.username}</b><span>@${user.username}</span></article>
      `).join('') || '<article><span>Hali o‘quvchi yo‘q</span></article>';
    }
    const recentVideos = document.querySelector('#admin-recent-videos');
    if (recentVideos) {
      recentVideos.innerHTML = videos.slice(0, 5).map((video) => `
        <article><b>${video.title}</b><span>${subjectLabel(video.subject)}</span></article>
      `).join('') || '<article><span>Hali video yo‘q</span></article>';
    }

    const userQuery = (document.querySelector('#admin-user-search')?.value || '').trim().toLowerCase();
    const usersBody = document.querySelector('#admin-users-body');
    if (usersBody) {
      const visibleUsers = users.filter((user) => {
        const haystack = `${user.name || ''} ${user.username}`.toLowerCase();
        return !userQuery || haystack.includes(userQuery);
      });
      usersBody.innerHTML = visibleUsers.map((user) => {
        const stats = getProgressFor(user);
        const roleClass = isAdminUser(user) ? 'owner' : user.blocked ? 'blocked' : 'student';
        const roleText = isAdminUser(user) ? 'Owner' : user.blocked ? 'Blok' : 'O‘quvchi';
        return `
        <tr>
          <td>${user.name || user.username}</td>
          <td>@${user.username}</td>
          <td><span class="admin-role ${roleClass}">${roleText}</span></td>
          <td>${displayPoints(user, stats.points)}</td>
          <td>${stats.streak || 0} kun</td>
          <td>${formatDateTime(user.lastLogin)}</td>
          <td>${isAdminUser(user) ? '' : `<div class="admin-actions">
            <button type="button" class="admin-mini" data-view-user="${user.username}">Ko‘rish</button>
            <button type="button" class="admin-mini" data-reset-progress="${user.username}">Nol</button>
            <button type="button" class="${user.blocked ? 'admin-mini' : 'admin-delete'}" data-block-user="${user.username}">${user.blocked ? 'Ochish' : 'Blok'}</button>
            <button type="button" class="admin-delete" data-delete-user="${user.username}">O‘chirish</button>
          </div>`}</td>
        </tr>`;
      }).join('') || '<tr><td colspan="7">Mos foydalanuvchi topilmadi.</td></tr>';
    }

    const rankingBody = document.querySelector('#admin-ranking-body');
    if (rankingBody) {
      const ranked = students
        .map((user) => ({ user, stats: getProgressFor(user) }))
        .sort((a, b) => (b.stats.points || 0) - (a.stats.points || 0));
      rankingBody.innerHTML = ranked.map((row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.user.name || row.user.username}</td>
          <td>@${row.user.username}</td>
          <td>${formatPoints(row.stats.points)}</td>
          <td>${rankFromPoints(row.stats.points)}</td>
          <td>${row.stats.streak || 0}</td>
          <td>${(row.stats.badges || []).length}</td>
          <td>${(row.stats.watchedVideos || []).length}</td>
        </tr>
      `).join('') || '<tr><td colspan="8">Hali o‘quvchi yo‘q</td></tr>';
    }

    const newsList = document.querySelector('#admin-news-list');
    if (newsList) {
      const news = readNews();
      newsList.innerHTML = news.map((item) => `
        <article class="admin-manual-item">
          <div>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </div>
          <button type="button" class="admin-delete" data-delete-news="${item.id}">O‘chirish</button>
        </article>
      `).join('') || '<p class="video-empty">Hali xabar yo‘q.</p>';
    }

    const videoList = document.querySelector('#admin-video-list');
    if (videoList) {
      if (!videos.length) {
        videoList.innerHTML = '<p class="video-empty">Hali video joylanmagan.</p>';
      } else {
        videoList.innerHTML = (await Promise.all(videos.map(async (video) => {
          const src = video.type === 'file' ? await getFileVideoUrl(video.id) : '';
          return `
            <article class="admin-video-item">
              <div class="video-frame">${videoPlayerHtml(video, src)}</div>
              <div>
                <h3>${video.title}</h3>
                <p>${subjectLabel(video.subject)} · ${formatDate(video.createdAt)}</p>
              </div>
              <div class="admin-actions">
                <button type="button" class="admin-mini" data-rename-video="${video.id}">Nom</button>
                <button type="button" class="admin-delete" data-delete-video="${video.id}">O‘chirish</button>
              </div>
            </article>
          `;
        }))).join('');
      }
    }

    const renderAdminManualList = (id, subject) => {
      const box = document.querySelector(id);
      if (!box) return;
      const list = readPdfs().filter((item) => item.subject === subject);
      box.innerHTML = list.map((item) => `
        <article class="admin-manual-item">
          <div>
            <h3>${item.title}</h3>
            <p>${formatDate(item.createdAt)}</p>
          </div>
          <div class="admin-actions">
            <button type="button" class="admin-mini" data-open-manual="${item.id}" data-manual-subject="${item.subject || ''}">O‘qish</button>
            <button type="button" class="admin-mini" data-rename-manual="${item.id}">Nom</button>
            <button type="button" class="admin-delete" data-delete-manual="${item.id}">O‘chirish</button>
          </div>
        </article>
      `).join('') || '<p class="video-empty">Hali PDF joylanmagan.</p>';
    };
    renderAdminManualList('#admin-bio-manuals', 'biologiya');
    renderAdminManualList('#admin-chem-manuals', 'kimyo');

    const barHtml = (label, value, max) => {
      const pct = max ? Math.round((value / max) * 100) : 0;
      return `<div class="analytics-bar"><span>${label}<small>${value}</small></span><i><b style="width:${pct}%"></b></i></div>`;
    };
    const courseBox = document.querySelector('#analytics-courses');
    if (courseBox) {
      courseBox.innerHTML = courses.map((course) => {
        const list = videos.filter((item) => item.subject === course.subject);
        const done = students.filter((user) => {
          const watched = getProgressFor(user).watchedVideos || [];
          return list.length && list.every((item) => watched.includes(item.id));
        }).length;
        return barHtml(`${course.icon} ${course.title} · ${done}/${students.length || 0}`, done, students.length);
      }).join('') || '<p class="video-empty">Hali o‘quvchi yo‘q.</p>';
    }
    const rankBox = document.querySelector('#analytics-ranks');
    if (rankBox) {
      const groups = { Yangi: 0, 'O‘quvchi': 0, 'Faol o‘quvchi': 0, Bilimdon: 0, Ustoz: 0 };
      studentProgress.forEach((item) => {
        const rank = rankFromPoints(item.points);
        groups[rank] = (groups[rank] || 0) + 1;
      });
      rankBox.innerHTML = Object.entries(groups).map(([name, count]) => barHtml(name, count, students.length)).join('');
    }
    const subjectBox = document.querySelector('#analytics-subjects');
    if (subjectBox) {
      const pdfs = readPdfs();
      const bioV = videos.filter((item) => item.subject === 'biologiya').length;
      const chemV = videos.filter((item) => item.subject === 'kimyo').length;
      const bioP = pdfs.filter((item) => item.subject === 'biologiya').length;
      const chemP = pdfs.filter((item) => item.subject === 'kimyo').length;
      const maxMat = Math.max(bioV + chemV + bioP + chemP, 1);
      subjectBox.innerHTML = [
        barHtml('🧬 Biologiya videolari', bioV, maxMat),
        barHtml('🧪 Kimyo videolari', chemV, maxMat),
        barHtml('📘 Biologiya PDF', bioP, maxMat),
        barHtml('📙 Kimyo PDF', chemP, maxMat)
      ].join('');
    }
    const topBox = document.querySelector('#analytics-top');
    if (topBox) {
      const ranked = students
        .map((user) => ({ user, stats: getProgressFor(user) }))
        .sort((a, b) => (b.stats.points || 0) - (a.stats.points || 0))
        .slice(0, 5);
      topBox.innerHTML = ranked.map((row, index) => `
        <article><b>${index + 1}. ${row.user.name || row.user.username}</b><span>${formatPoints(row.stats.points)} ball</span></article>
      `).join('') || '<article><span>Hali o‘quvchi yo‘q</span></article>';
    }

    const bonusSelect = document.querySelector('[name="bonus-user"]');
    if (bonusSelect) {
      const current = bonusSelect.value;
      bonusSelect.innerHTML = students.map((user) => `
        <option value="${user.username}">${user.name || user.username} (@${user.username})</option>
      `).join('') || '<option value="">O‘quvchi yo‘q</option>';
      if (current) bonusSelect.value = current;
    }

    const bannerForm = document.querySelector('#admin-banner-form');
    const liveBanner = readBanner();
    if (bannerForm && liveBanner) {
      const titleInput = bannerForm.querySelector('[name="banner-title"]');
      const textInput = bannerForm.querySelector('[name="banner-text"]');
      if (titleInput && !titleInput.value) titleInput.value = liveBanner.title;
      if (textInput && !textInput.value) textInput.value = liveBanner.text || '';
    }

    const activityBox = document.querySelector('#admin-activity-log');
    if (activityBox) {
      const logs = readActivity();
      activityBox.innerHTML = logs.map((item) => `
        <article><b>${item.text}</b><span>${formatDateTime(item.at)}</span></article>
      `).join('') || '<article><span>Hali amal yo‘q</span></article>';
    }
  };

  if (loginForm && usernameInput && passwordInput) {
    const message = attachFormMessage(loginForm);
    attachPasswordToggle(passwordInput);

    const clearError = () => {
      message.hidden = true;
      usernameInput.classList.remove('input-invalid');
      passwordInput.classList.remove('input-invalid');
    };

    usernameInput.addEventListener('input', clearError);
    passwordInput.addEventListener('input', clearError);

    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
      const user = findUser(username);

      if (user && user.password === password && user.blocked && !isAdminUser(user)) {
        showFormError(loginForm, message, 'Hisobingiz vaqtincha yopilgan. Adminga murojaat qiling.', [usernameInput]);
        return;
      }

      if (user && user.password === password) {
        message.hidden = true;
        if (loginButton) {
          loginButton.disabled = true;
          loginButton.textContent = 'Kirilmoqda...';
        }
        window.setTimeout(() => {
          if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = 'Tizimga kirish';
          }
          enterAccount(user);
        }, 250);
        return;
      }

      showFormError(loginForm, message, 'Login yoki parol noto‘g‘ri.', [usernameInput, passwordInput]);
    });
  }

  if (registerForm && fullNameInput && regUsernameInput && regPasswordInput && regConfirmInput) {
    const message = attachFormMessage(registerForm);
    attachPasswordToggle(regPasswordInput);
    attachPasswordToggle(regConfirmInput);

    const clearRegisterError = () => {
      message.hidden = true;
      [fullNameInput, regUsernameInput, regPasswordInput, regConfirmInput].forEach((input) => {
        input.classList.remove('input-invalid');
      });
    };

    [fullNameInput, regUsernameInput, regPasswordInput, regConfirmInput].forEach((input) => {
      input.addEventListener('input', clearRegisterError);
    });

    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = fullNameInput.value.trim();
      const username = regUsernameInput.value.trim();
      const password = regPasswordInput.value;
      const confirm = regConfirmInput.value;

      if (name.length < 2) {
        showFormError(registerForm, message, 'Ism familiyani kiriting.', [fullNameInput]);
        return;
      }
      if (!/^[a-zA-Z0-9._]{3,20}$/.test(username)) {
        showFormError(registerForm, message, 'Login 3–20 belgi: harf, raqam, nuqta yoki pastki chiziq.', [regUsernameInput]);
        return;
      }
      if (password.length < 6) {
        showFormError(registerForm, message, 'Parol kamida 6 belgidan iborat bo‘lsin.', [regPasswordInput]);
        return;
      }
      if (password !== confirm) {
        showFormError(registerForm, message, 'Parollar mos emas.', [regPasswordInput, regConfirmInput]);
        return;
      }
      if (username.toLowerCase() === ADMIN_USER.username || findUser(username)) {
        showFormError(registerForm, message, 'Bu login band. Boshqa login tanlang.', [regUsernameInput]);
        return;
      }

      const users = readUsers();
      const newUser = { username, password, name, role: 'student', createdAt: Date.now() };
      users.push(newUser);
      saveUsers(users);
      saveProgressFor(newUser, defaultProgress());

      message.classList.add('success');
      message.hidden = false;
      message.textContent = 'Hisob yaratildi. Tizimga kiritilmoqda...';
      if (registerButton) {
        registerButton.disabled = true;
        registerButton.textContent = 'Yaratilmoqda...';
      }
      window.setTimeout(() => {
        if (registerButton) {
          registerButton.disabled = false;
          registerButton.textContent = 'Hisob yaratish';
        }
        registerForm.reset();
        message.hidden = true;
        enterAccount(newUser);
      }, 400);
    });
  }

  document.querySelector('#show-register')?.addEventListener('click', () => showAuthMode('register'));
  document.querySelector('#show-login')?.addEventListener('click', () => showAuthMode('login'));

  const tryChangePassword = (form, currentInput, newInput, confirmInput, messageEl) => {
    const currentPass = currentInput.value;
    const nextPass = newInput.value;
    const confirmPass = confirmInput.value;
    [currentInput, newInput, confirmInput].forEach((input) => input.classList.remove('input-invalid'));
    const live = findUser(currentUser?.username);
    if (!live || live.password !== currentPass) {
      showFormError(form, messageEl, 'Joriy parol noto‘g‘ri.', [currentInput]);
      return;
    }
    if (nextPass.length < 6) {
      showFormError(form, messageEl, 'Yangi parol kamida 6 belgidan iborat bo‘lsin.', [newInput]);
      return;
    }
    if (nextPass !== confirmPass) {
      showFormError(form, messageEl, 'Yangi parollar mos emas.', [newInput, confirmInput]);
      return;
    }
    if (nextPass === currentPass) {
      showFormError(form, messageEl, 'Yangi parol joriy paroldan farq qilsin.', [newInput]);
      return;
    }
    updateCurrentUser({ password: nextPass });
    messageEl.classList.add('success');
    messageEl.hidden = false;
    messageEl.textContent = 'Parol o‘zgartirildi. Keyingi safar yangi parol bilan kirasiz.';
    form.reset();
  };

  const profileForm = document.querySelector('#settings-profile-form');
  const passwordForm = document.querySelector('#settings-password-form');
  const adminPasswordForm = document.querySelector('#admin-password-form');
  const settingsCurrent = document.querySelector('input[name="settings-current"]');
  const settingsNew = document.querySelector('input[name="settings-new"]');
  const settingsConfirm = document.querySelector('input[name="settings-confirm"]');
  const adminCurrent = document.querySelector('input[name="admin-current"]');
  const adminNew = document.querySelector('input[name="admin-new"]');
  const adminConfirm = document.querySelector('input[name="admin-confirm"]');

  [settingsCurrent, settingsNew, settingsConfirm, adminCurrent, adminNew, adminConfirm].forEach(attachPasswordToggle);

  profileForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = profileForm.querySelector('input[name="settings-name"]');
    const message = document.querySelector('#settings-profile-message');
    const name = nameInput.value.trim();
    nameInput.classList.remove('input-invalid');
    if (name.length < 2) {
      showFormError(profileForm, message, 'Ism kamida 2 belgidan iborat bo‘lsin.', [nameInput]);
      return;
    }
    updateCurrentUser({ name });
    message.classList.add('success');
    message.hidden = false;
    message.textContent = 'Ism saqlandi.';
  });

  const setAvatarMessage = (el, text, ok = true) => {
    if (!el) return;
    el.hidden = !text;
    el.textContent = text;
    el.classList.toggle('success', ok);
  };

  const saveAvatarFile = async (file, messageEl, input) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp)$/i.test(file.name);
    if (!isImage) {
      setAvatarMessage(messageEl, 'Faqat rasm fayl tanlang.', false);
      if (input) input.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarMessage(messageEl, 'Rasm 8 MB dan katta bo‘lmasin.', false);
      if (input) input.value = '';
      return;
    }
    try {
      const avatar = await compressAvatar(file);
      updateCurrentUser({ avatar });
      setAvatarMessage(messageEl, 'Profil rasmi saqlandi.', true);
    } catch {
      setAvatarMessage(messageEl, 'Rasmni saqlab bo‘lmadi. Boshqa rasm tanlang.', false);
    }
    if (input) input.value = '';
  };

  const bindAvatarPicker = (fileInput, removeBtn, messageEl) => {
    fileInput?.addEventListener('change', () => {
      saveAvatarFile(fileInput.files?.[0], messageEl, fileInput);
    });
    removeBtn?.addEventListener('click', () => {
      updateCurrentUser({ avatar: '' });
      setAvatarMessage(messageEl, 'Profil rasmi olib tashlandi.', true);
    });
  };

  bindAvatarPicker(
    document.querySelector('#settings-avatar-file'),
    document.querySelector('#settings-avatar-remove'),
    document.querySelector('#settings-avatar-message')
  );
  bindAvatarPicker(
    document.querySelector('#admin-avatar-file'),
    document.querySelector('#admin-avatar-remove'),
    document.querySelector('#admin-avatar-message')
  );

  passwordForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    tryChangePassword(
      passwordForm,
      settingsCurrent,
      settingsNew,
      settingsConfirm,
      document.querySelector('#settings-password-message')
    );
  });

  adminPasswordForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    tryChangePassword(
      adminPasswordForm,
      adminCurrent,
      adminNew,
      adminConfirm,
      document.querySelector('#admin-password-message')
    );
  });

  const existingSession = readSession();
  const sessionUser = existingSession ? findUser(existingSession.username) : null;
  if (sessionUser) {
    applyUserToUi({ ...sessionUser, name: existingSession.name || sessionUser.name });
    if (isAdminUser(sessionUser)) showAdmin();
    else showDashboard();
  } else {
    showAuthMode('login');
    showLogin();
  }

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedSubject = '';
      openView(button.dataset.view);
      renderAll();
    });
  });

  document.querySelector('#continue-lesson')?.addEventListener('click', () => {
    applyProgressToCourses(getProgress());
    const next = courses.find((course) => course.progress < 100) || courses[0];
    openCourse(next.id);
  });

  document.querySelector('#back-from-course-videos')?.addEventListener('click', () => {
    openView('courses');
    renderAll();
  });

  document.querySelector('#back-from-lesson')?.addEventListener('click', () => {
    openView('courses');
    renderAll();
  });

  document.querySelector('#complete-unit')?.addEventListener('click', completeUnit);

  dashboard?.addEventListener('click', (event) => {
    const courseButton = event.target.closest('[data-open-course]');
    const subjectButton = event.target.closest('[data-open-subject]');
    const unitButton = event.target.closest('[data-unit]');
    const downloadManualBtn = event.target.closest('[data-download-manual]');
    const openManualBtn = event.target.closest('[data-open-manual]');
    if (courseButton) {
      event.preventDefault();
      openCourse(courseButton.dataset.openCourse);
    } else if (subjectButton) {
      openSubject(subjectButton.dataset.openSubject);
    } else if (unitButton) {
      activeUnit = Number(unitButton.dataset.unit);
      renderLesson();
    } else if (downloadManualBtn) {
      event.preventDefault();
      downloadManual(downloadManualBtn.dataset.downloadManual, downloadManualBtn.dataset.manualSubject);
    } else if (openManualBtn) {
      event.preventDefault();
      openPdfModal(openManualBtn.dataset.openManual, openManualBtn.dataset.manualSubject);
    }
  });

  searchInput?.addEventListener('input', () => {
    if (document.querySelector('#view-lesson')?.hidden === false) return;
    const current = [...document.querySelectorAll('.dash-view')].find((view) => !view.hidden);
    if (['view-home', 'view-courses', 'view-subjects', 'view-videos', 'view-manuals', 'view-course-videos'].includes(current?.id)) {
      renderAll();
    }
  });

  notificationButton?.addEventListener('click', () => {
    if (!notificationPanel) return;
    notificationPanel.hidden = !notificationPanel.hidden;
  });

  document.addEventListener('click', (event) => {
    if (!notificationPanel || notificationPanel.hidden) return;
    if (event.target.closest('#notification-button') || event.target.closest('#notification-panel')) return;
    notificationPanel.hidden = true;
  });

  const listTitles = (items) => items.map((item) => `• ${item.title}`).join('\n') || '• Hali joylanmagan';

  const answers = [
    {
      id: 'settings',
      words: ['sozlama', 'parolni', 'parol o‘zgartir', 'parol ozgartir', 'profil rasm', 'avatar'],
      text: 'Sozlamalar bo‘limida:\n• Ismni o‘zgartirasiz\n• Profil rasmi qo‘yasiz\n• Parolni o‘zingiz bemalol yangilaysiz\n\nJoriy parol + yangi parol (2 marta). Admin parolni tiklamaydi.'
    },
    {
      id: 'about',
      words: ['biz haqimizda', 'haqimizda', 'yaratuvchi', 'muallif', 'hasanjon', 'kim yaratgan', 'sayt kimniki'],
      text: 'BioKimyo — 8-sinf biologiya va kimyo platformasi.\n\nMening kurslarim:\n🧬 Biologiya video dars\n🧪 Kimyo video dars\n\nPDF qo‘llanmalar va AI yordamchi ham bor.\nSayt yaratuvchisi — Muqimjonov Hasanjon. 🌿🧪'
    },
    {
      id: 'contact',
      words: ['murojaat', 'aloqa', 'telefon', 'nomer', 'bog‘lan', 'qongiroq'],
      text: 'Biz bilan +998 99 175 4018 raqami orqali bog‘lanishingiz mumkin. 😊'
    },
    {
      id: 'hello',
      words: ['salom', 'assalom', 'hello', 'hi', 'qalesan', 'qalaysiz'],
      text: () => {
        const name = currentUser?.name || currentUser?.username || 'do‘stim';
        return `Salom, ${name}! Men BioKimyo AI — 8-sinf biologiya va kimyo o‘qituvchiman.\n\nSo‘rashingiz mumkin:\n• Hujayra, fotosintez, DNK\n• Atom, molekula, suv, kislota\n• Video dars, PDF, ball\n• “Test ber” — savol beraman`;
      }
    },
    {
      id: 'thanks',
      words: ['rahmat', 'tashakkur', 'raxmat'],
      text: 'Arzimaydi! Yana tushunmagan joyingiz bo‘lsa, yozing. “Test ber” desangiz, savol beraman. 🌟'
    },
    {
      id: 'points',
      words: ['ball', 'reyting', 'yutuq', 'seriya', 'qanday to‘pla', 'nechta ball', 'daraja'],
      text: () => {
        const progress = getProgress();
        const watched = (progress.watchedVideos || []).length;
        const manuals = (progress.openedManuals || []).length;
        return `Sizning natijangiz:\n⭐ ${formatPoints(progress.points)} ball\n🎯 ${rankFromPoints(progress.points)}\n🔥 ${progress.streak || 0} kun seriya\n🎬 ${watched} video · 📘 ${manuals} PDF\n\nQanday oshadi?\n• Videoni oxirigacha ko‘rsangiz +80\n• PDF “O‘qish” +20\n• Admin bonus berishi mumkin\n\nReyting: Yangi (0) → O‘quvchi (100) → Faol (400) → Bilimdon (1000) → Ustoz (2000)`;
      }
    },
    {
      id: 'pdf',
      words: ['pdf', 'qo‘llanma', 'qollanma', 'kitob', 'darslik'],
      text: () => {
        const pdfs = readPdfs();
        const bio = pdfs.filter((item) => item.subject === 'biologiya');
        const chem = pdfs.filter((item) => item.subject === 'kimyo');
        return `Qo‘llanmalar bo‘limida Biologiya va Kimyo PDFlari alohida.\n“O‘qish” — onlayn ochiladi, +20 ball.\n\n🧬 Biologiya:\n${listTitles(bio)}\n\n🧪 Kimyo:\n${listTitles(chem)}`;
      }
    },
    {
      id: 'video',
      words: ['video dars', 'video', 'tomosha', 'videolar'],
      text: () => {
        const videos = readVideos();
        const bio = videos.filter((item) => item.subject === 'biologiya');
        const chem = videos.filter((item) => item.subject === 'kimyo');
        const watched = new Set(getProgress().watchedVideos || []);
        const left = videos.filter((item) => !watched.has(item.id)).length;
        return `Mening kurslarimda 2 ta video dars bor:\n🧬 Biologiya video dars — ${bio.length} ta\n🧪 Kimyo video dars — ${chem.length} ta\n\nVideoni oxirigacha ko‘rsangiz +80 ball.\n${left ? `${left} ta video hali ko‘rilmagan.` : videos.length ? 'Hamma videolarni ko‘rib bo‘lgansiz. 👏' : 'Hali video joylanmagan — admin qo‘shadi.'}\n\n🧬 Biologiya:\n${listTitles(bio)}\n\n🧪 Kimyo:\n${listTitles(chem)}`;
      }
    },
    {
      id: 'login',
      words: ['kirish', 'login', 'ro‘yxat', 'royxat', 'hisob yarat'],
      text: 'Ro‘yxatdan o‘ting — ism, login va parol kifoya. Keyin shu login bilan kirasiz.\nParolni Sozlamalardan o‘zingiz o‘zgartirasiz.\nOwner: login `admin`, parol `admin2012`.'
    },
    {
      id: 'cell',
      words: ['hujayra', 'kletka', 'cell', 'membrana', 'yadro', 'organoid', 'mitoxondriya', 'sitoplazma'],
      text: 'Hujayra — barcha tirik organizmlarning eng kichik tuzilish va faoliyat birligi.\n\n🧬 Asosiy qismlari:\n• Membrana — tanlab o‘tkazuvchan qobiq\n• Sitoplazma — ichidagi yarim suyuqlik\n• Yadro — DNK, irsiy ma’lumot\n• Mitoxondriya — energiya (ATP)\n• Xloroplast — faqat o‘simlikda, fotosintez\n\nO‘simlik hujayrasida hujayra devori va vakuola bor, hayvonnikida yo‘q.\nRobert Guk 1665-yilda hujayrani kashf etgan.\n\nBuni “Biologiya video dars”da ham ko‘ring.'
    },
    {
      id: 'photo',
      words: ['fotosintez', 'xlorofill', 'xloroplast', 'kislorod ajrat'],
      text: 'Fotosintez — o‘simlikning oziq modda hosil qilish jarayoni.\n\n☀️ Formula:\n6CO₂ + 6H₂O + nur → C₆H₁₂O₆ + 6O₂\n\n• Asosan bargda kechadi\n• Xlorofill yashil rang beradi va nurni yutadi\n• Natija: glyukoza (oziq) va kislorod\n\nNafas olish esa teskarisi: oziq + O₂ → CO₂ + energiya.\nVideo: Biologiya video dars.'
    },
    {
      id: 'plant',
      words: ['o‘simlik', 'osimlik', 'barg', 'ildiz', 'poya', 'gul'],
      text: 'O‘simlik organlari:\n• Ildiz — suv va tuzlarni so‘radi\n• Poya — moddalarni tashiydi, tik tutadi\n• Barg — fotosintez va transpiratsiya\n• Gul — ko‘payish\n\nO‘simlik hujayrasida xloroplast, hujayra devori va katta vakuola bor. 🌱'
    },
    {
      id: 'tissue',
      words: ['to‘qima', 'toqima', 'organ', 'organizma', 'sistema'],
      text: 'Tuzilish bosqichlari:\nHujayra → to‘qima → organ → sistema → organizm\n\nBir xil vazifali hujayralar to‘qima hosil qiladi.\nMasalan, yurak — organ, qon — suyuq to‘qima, asab — sistema.'
    },
    {
      id: 'atom',
      words: ['atom', 'proton', 'elektron', 'neytron', 'yadro zaryad'],
      text: 'Atom — kimyoviy elementning eng kichik zarrasi.\n\n⚛️ Tuzilishi:\n• Proton (+) — yadroda, tartib raqamini belgilaydi\n• Neytron (0) — yadroda, massaga qo‘shiladi\n• Elektron (−) — yadro atrofida aylanadi\n\nAtom massasi ≈ proton + neytron.\nBuni “Kimyo video dars”da ko‘ring.'
    },
    {
      id: 'molecule',
      words: ['molekula', 'modda', 'aralashma', 'xossa', 'sof modda', 'birikma'],
      text: 'Sof modda — bitta turdagi zarralar (suv, temir, kislorod).\nAralashma — ikki yoki undan ortiq modda (havo, sut, tuproq).\n\nMolekula — atomlar birikmasi: H₂O, O₂, CO₂.\n\nFizik o‘zgarish: erish, bug‘lanish — yangi modda yo‘q.\nKimyoviy o‘zgarish: yonish, zangash — yangi modda bor.'
    },
    {
      id: 'water',
      words: ['suv', 'h2o', 'h₂o', 'vodorod oksid'],
      text: 'Suv — H₂O: 2 ta vodorod + 1 ta kislorod. Sof modda.\n\n💧 Xossalari:\n• Rangsiz, hidsiz suyuqlik\n• 0°C da muzlaydi, 100°C da qaynaydi\n• Yaxshi erituvchi\n• Tirik organizmlar uchun zarur\n\nHavo esa aralashma: N₂, O₂, CO₂ va boshqalar.'
    },
    {
      id: 'dna',
      words: ['dna', 'dnk', 'irsiyat', 'gen', 'xromosoma'],
      text: 'DNK (DNK) irsiy ma’lumotni saqlaydi, asosan yadroda.\n\n🧬 Qisqa:\n• Gen — bir belgi uchun javob beradigan DNK qismi\n• Xromosoma — DNK ning o‘ralgan ko‘rinishi\n• Odamda odatda 46 ta xromosoma\n\nBolalar ota-onadan genlarni meros qilib oladi.'
    },
    {
      id: 'table',
      words: ['mendeleyev', 'jadval', 'element', 'davriy', 'kislorod belgisi', 'uglerod'],
      text: 'Davriy jadvalni D. I. Mendeleyev tuzgan.\n\nAsosiy belgilar:\n• H — vodorod\n• O — kislorod\n• C — uglerod\n• N — azot\n• Fe — temir\n• Na — natriy\n• Cl — xlor\n\nChapda metallar, o‘ngda nometallar. Tartib raqami = protonlar soni.'
    },
    {
      id: 'lab',
      words: ['xavfsizlik', 'tajriba', 'laboratoriya', 'kislota', 'ishqor', 'tuz'],
      text: 'Laboratoriya qoidalari:\n• Xalat, ko‘zoynak, qo‘lqop\n• Moddani tatib ko‘rmang, hidlamang\n• Kislota ustiga suv quyilmaydi — suv ustiga kislota sekin\n• Spirt lampasini ehtiyot oching\n\nKislota — nordon (HCl, H₂SO₄).\nAsos (ishqor) — sirka teskari, masalan NaOH.\nTuz — kislota + asos reaksiyasidan.'
    },
    {
      id: 'breath',
      words: ['nafas', 'o‘pka', 'opka', 'kislorod nafas', 'karbonat'],
      text: 'Nafas olish: oziq modda + O₂ → CO₂ + H₂O + energiya.\nBu fotosintezga teskari.\n\nOdam o‘pkada gaz almashadi: kislorod kiradi, CO₂ chiqadi.\nO‘simlik tunda ham nafas oladi, kunduzi fotosintez ustun.'
    },
    {
      id: 'food',
      words: ['oziq', 'oqsil', 'yog‘', 'yog', 'uglevod', 'vitamin', 'ferment'],
      text: 'Asosiy oziq moddalar:\n• Oqsillar — o‘sish, hujayra qurilishi\n• Yog‘lar — zaxira energiya\n• Uglevodlar — tez energiya (glyukoza, kraxmal)\n• Vitaminlar — oz miqdorda zarur\n\nFermentlar reaksiyalarni tezlatadi. Ovqat hazmida muhim.'
    },
    {
      id: 'eco',
      words: ['ekologiya', 'oziq zanjir', 'muhit', 'tabiat', 'hayvonot'],
      text: 'Oziq zanjiri: ishlab chiqaruvchi (o‘simlik) → iste’molchi (hayvon) → parchalovchi (bakteriya, zamburug‘).\n\nFotosintez yer yuzidagi oziq va kislorodning asosi.\nTabiatni asrang: daraxt, suv, havo — hayot manbai. 🌍'
    },
    {
      id: 'admin',
      words: ['admin', 'owner', 'panel', 'bonus'],
      text: 'Owner panelida o‘quvchilar, videolar, PDF, reyting, xabarlar, analitika va vositalar bor.\nBonus ball, bloklash, CSV va zaxira ham shu yerda.\nKirish: admin / admin2012.\nVideo joylansa, “Biologiya video dars” yoki “Kimyo video dars”ga tushadi.'
    },
    {
      id: 'how',
      words: ['qanday ishlat', 'qayerdan boshl', 'nima qilay', 'yordam ber', 'qanday o‘qi'],
      text: 'Qanday o‘qish kerak:\n1. Mening kurslarim → Biologiya yoki Kimyo video dars\n2. Videoni oxirigacha ko‘ring (+80 ball)\n3. Qo‘llanmalar → PDF ni “O‘qish” (+20)\n4. Har kuni kirsangiz, seriya oshadi 🔥\n\nTushunmagan mavzuni menga yozing yoki “Test ber” deng.'
    }
  ];



  const aiQuizzes = [
    {
      question: 'Tirik organizmlarning eng kichik tuzilish birligi nima?',
      options: ['To‘qima', 'Hujayra', 'Organ'],
      answer: 1,
      explain: 'Hujayra — eng kichik tuzilish va faoliyat birligi. To‘qima va organlar hujayralardan tuziladi.'
    },
    {
      question: 'Fotosintezda o‘simlik nima ajratib chiqaradi?',
      options: ['Azot', 'Kislorod', 'Vodorod'],
      answer: 1,
      explain: 'Fotosintezda CO₂ va suvdan oziq hosil bo‘ladi, kislorod ajralib chiqadi.'
    },
    {
      question: 'Atom yadrosida nima joylashgan?',
      options: ['Faqat elektronlar', 'Proton va neytron', 'Faqat molekula'],
      answer: 1,
      explain: 'Yadroda proton (+) va neytron (0) bor. Elektronlar yadro atrofida aylanadi.'
    },
    {
      question: 'Qaysi biri kimyoviy o‘zgarish?',
      options: ['Muzning erishi', 'Qog‘ozning yonishi', 'Suvning bug‘lanishi'],
      answer: 1,
      explain: 'Yonishda yangi modda hosil bo‘ladi. Erish va bug‘lanish — fizik o‘zgarish.'
    },
    {
      question: 'Suvning kimyoviy formulasi qanday?',
      options: ['CO₂', 'H₂O', 'O₂'],
      answer: 1,
      explain: 'Suv — 2 ta vodorod va 1 ta kislorod: H₂O.'
    },
    {
      question: 'Xlorofill qayerda bo‘ladi va nima qiladi?',
      options: ['Yadroda DNK saqlaydi', 'Bargda nurni yutadi', 'Qonda kislorod tashiydi'],
      answer: 1,
      explain: 'Xlorofill barg xloroplastida bo‘ladi, quyosh nurini yutib fotosintezni boshlaydi.'
    }
  ];





  const doLogout = () => {
    currentUser = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
    showAuthMode('login');
    showLogin();
    usernameInput?.focus();
  };

  logoutButton?.addEventListener('click', doLogout);
  document.querySelector('#admin-logout')?.addEventListener('click', doLogout);
  document.querySelector('#admin-open-site')?.addEventListener('click', () => {
    if (!isAdminUser(currentUser)) return;
    showDashboard();
  });
  adminReturn?.addEventListener('click', () => {
    if (!isAdminUser(currentUser)) return;
    showAdmin();
  });

  document.querySelectorAll('[data-admin-view]').forEach((button) => {
    button.addEventListener('click', () => openAdminView(button.dataset.adminView));
  });

  document.querySelector('#admin-add-user')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector('#admin-user-message');
    const name = form.querySelector('[name="admin-name"]')?.value.trim() || '';
    const username = form.querySelector('[name="admin-username"]')?.value.trim() || '';
    const password = form.querySelector('[name="admin-password"]')?.value || '';

    if (name.length < 2) {
      setAdminMessage(message, 'Ism familiyani kiriting.');
      return;
    }
    if (!/^[a-zA-Z0-9._]{3,20}$/.test(username)) {
      setAdminMessage(message, 'Login 3–20 belgi: harf, raqam, nuqta yoki pastki chiziq.');
      return;
    }
    if (password.length < 6) {
      setAdminMessage(message, 'Parol kamida 6 belgidan iborat bo‘lsin.');
      return;
    }
    if (username.toLowerCase() === ADMIN_USER.username || findUser(username)) {
      setAdminMessage(message, 'Bu login band.');
      return;
    }

    const users = readUsers();
    const newUser = { username, password, name, role: 'student', createdAt: Date.now() };
    users.push(newUser);
    saveUsers(users);
    saveProgressFor(newUser, defaultProgress());
    form.reset();
    setAdminMessage(message, 'O‘quvchi qo‘shildi. Ballari 0 dan boshlanadi.', true);
    logAdmin(`Yangi o‘quvchi: ${name}`);
    renderAdmin();
  });

  document.querySelector('#admin-add-video')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector('#admin-video-message');
    const title = form.querySelector('[name="video-title"]')?.value.trim() || '';
    const subject = form.querySelector('[name="video-subject"]')?.value || 'biologiya';
    const file = form.querySelector('[name="video-file"]')?.files?.[0];

    if (title.length < 2) {
      setAdminMessage(message, 'Video nomini kiriting.');
      return;
    }
    if (!file) {
      setAdminMessage(message, 'Kompyuterdan video fayl tanlang.');
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      setAdminMessage(message, 'Fayl 40 MB dan katta bo‘lmasin.');
      return;
    }

    const video = {
      id: `vid-${Date.now()}`,
      title,
      subject,
      type: 'file',
      url: '',
      createdAt: Date.now()
    };

    try {
      await saveVideoFile(video.id, file);
      const videos = readVideos();
      videos.unshift(video);
      saveVideos(videos);
      form.reset();
      setAdminMessage(message, 'Video joylandi. O‘quvchilar ko‘ra oladi.', true);
      logAdmin(`Video: ${title}`);
      renderAdmin();
      renderStudentVideos();
    } catch {
      setAdminMessage(message, 'Faylni saqlab bo‘lmadi. Boshqa video tanlab ko‘ring.');
    }
  });

  document.querySelector('#admin-add-manual')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector('#admin-manual-message');
    const title = form.querySelector('[name="manual-title"]')?.value.trim() || '';
    const subject = form.querySelector('[name="manual-subject"]')?.value || 'biologiya';
    const file = form.querySelector('[name="manual-file"]')?.files?.[0];

    if (title.length < 2) {
      setAdminMessage(message, 'Qo‘llanma nomini kiriting.');
      return;
    }
    if (subject === 'laboratoriya' || !['biologiya', 'kimyo'].includes(subject)) {
      setAdminMessage(message, 'Faqat biologiya yoki kimyo tanlang.');
      return;
    }
    if (!file) {
      setAdminMessage(message, 'Kompyuterdan PDF fayl tanlang.');
      return;
    }
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      setAdminMessage(message, 'Faqat PDF fayl joylash mumkin.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setAdminMessage(message, 'Fayl 20 MB dan katta bo‘lmasin.');
      return;
    }

    const pdf = {
      id: `pdf-${Date.now()}`,
      title,
      subject,
      createdAt: Date.now()
    };

    try {
      await saveVideoFile(pdf.id, file);
      const pdfs = readPdfs();
      pdfs.unshift(pdf);
      savePdfs(pdfs);
      form.reset();
      setAdminMessage(message, 'PDF qo‘llanma joylandi.', true);
      logAdmin(`PDF: ${title}`);
      renderAdmin();
      renderStudentManuals();
    } catch {
      setAdminMessage(message, 'PDF ni saqlab bo‘lmadi. Boshqa fayl tanlab ko‘ring.');
    }
  });

  document.querySelector('#admin-user-search')?.addEventListener('input', () => renderAdmin());

  document.querySelector('#admin-add-news')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector('#admin-news-message');
    const title = form.querySelector('[name="news-title"]')?.value.trim() || '';
    const text = form.querySelector('[name="news-text"]')?.value.trim() || '';
    if (title.length < 2 || text.length < 2) {
      setAdminMessage(message, 'Sarlavha va matnni kiriting.');
      return;
    }
    const news = readNews();
    news.unshift({ id: `news-${Date.now()}`, title, text, createdAt: Date.now() });
    saveNews(news);
    form.reset();
    setAdminMessage(message, 'Xabar o‘quvchilarga chiqarildi.', true);
    logAdmin(`Xabar: ${title}`);
    renderAdmin();
  });

  document.querySelector('#admin-bonus-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector('#admin-bonus-message');
    const username = form.querySelector('[name="bonus-user"]')?.value;
    const points = Number(form.querySelector('[name="bonus-points"]')?.value);
    const reason = form.querySelector('[name="bonus-reason"]')?.value.trim();
    if (!username) {
      setAdminMessage(message, 'O‘quvchi tanlang.');
      return;
    }
    if (giveBonus(username, points, reason)) {
      form.querySelector('[name="bonus-reason"]').value = '';
      setAdminMessage(message, `${points} ball berildi.`, true);
      renderAdmin();
    } else {
      setAdminMessage(message, 'Ball berilmadi. Qiymatni tekshiring.');
    }
  });

  document.querySelector('#admin-broadcast-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector('#admin-broadcast-message');
    const points = Number(form.querySelector('[name="broadcast-points"]')?.value);
    const reason = form.querySelector('[name="broadcast-reason"]')?.value.trim() || 'Umumiy bonus';
    if (!Number.isFinite(points) || points < 1) {
      setAdminMessage(message, 'Ballni kiriting.');
      return;
    }
    const students = readUsers().filter((user) => !isAdminUser(user));
    students.forEach((user) => giveBonus(user.username, points, reason));
    logAdmin(`Hammaga +${points} ball`);
    form.reset();
    setAdminMessage(message, `${students.length} o‘quvchiga +${points} ball yuborildi.`, true);
    renderAdmin();
  });

  document.querySelector('#admin-banner-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector('#admin-banner-message');
    const title = form.querySelector('[name="banner-title"]')?.value.trim() || '';
    const text = form.querySelector('[name="banner-text"]')?.value.trim() || '';
    if (title.length < 2) {
      setAdminMessage(message, 'Sarlavhani kiriting.');
      return;
    }
    saveBanner({ title, text, at: Date.now() });
    logAdmin(`Bosh sahifa xabari: ${title}`);
    setAdminMessage(message, 'Xabar o‘quvchilar bosh sahifasida chiqadi.', true);
    applyBanner();
  });

  document.querySelector('#admin-banner-clear')?.addEventListener('click', () => {
    saveBanner(null);
    const form = document.querySelector('#admin-banner-form');
    form?.reset();
    logAdmin('Bosh sahifa xabari olib tashlandi');
    setAdminMessage(document.querySelector('#admin-banner-message'), 'Xabar olib tashlandi.', true);
    applyBanner();
  });

  document.querySelector('#admin-export-users')?.addEventListener('click', () => {
    const rows = [['Ism', 'Login', 'Rol', 'Ball', 'Seriya', 'Blok', 'Kirgan']];
    readUsers().forEach((user) => {
      const stats = getProgressFor(user);
      rows.push([
        user.name || user.username,
        user.username,
        isAdminUser(user) ? 'owner' : 'oquvchi',
        stats.points || 0,
        stats.streak || 0,
        user.blocked ? 'ha' : 'yoq',
        user.lastLogin ? new Date(user.lastLogin).toISOString() : ''
      ]);
    });
    downloadBlob('biokimyo-foydalanuvchilar.csv', rows.map((row) => row.map(csvEscape).join(',')).join('\n'), 'text/csv');
    logAdmin('O‘quvchilar CSV yuklab olindi');
  });

  document.querySelector('#admin-export-ranking')?.addEventListener('click', () => {
    const rows = [['#', 'Ism', 'Login', 'Ball', 'Daraja', 'Seriya', 'Yutuq', 'Video']];
    readUsers()
      .filter((user) => !isAdminUser(user))
      .map((user) => ({ user, stats: getProgressFor(user) }))
      .sort((a, b) => (b.stats.points || 0) - (a.stats.points || 0))
      .forEach((row, index) => {
        rows.push([
          index + 1,
          row.user.name || row.user.username,
          row.user.username,
          row.stats.points || 0,
          rankFromPoints(row.stats.points),
          row.stats.streak || 0,
          (row.stats.badges || []).length,
          (row.stats.watchedVideos || []).length
        ]);
      });
    downloadBlob('biokimyo-reyting.csv', rows.map((row) => row.map(csvEscape).join(',')).join('\n'), 'text/csv');
    logAdmin('Reyting CSV yuklab olindi');
  });

  document.querySelector('#admin-export-backup')?.addEventListener('click', () => {
    const backup = {
      users: readUsers(),
      videos: readVideos(),
      pdfs: readPdfs(),
      progress: readAllProgress(),
      news: readNews(),
      banner: readBanner(),
      activity: readActivity(),
      exportedAt: Date.now()
    };
    downloadBlob(`biokimyo-zaxira-${todayKey()}.json`, JSON.stringify(backup, null, 2), 'application/json');
    logAdmin('Zaxira JSON yuklab olindi');
  });

  document.querySelector('#admin-import-backup')?.addEventListener('change', (event) => {
    const file = event.currentTarget.files?.[0];
    const message = document.querySelector('#admin-backup-message');
    if (!file) return;
    if (!window.confirm('Zaxira tiklansa hozirgi ro‘yxat, ball va xabarlar o‘zgaradi. Davom etasizmi?')) {
      event.currentTarget.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}'));
        if (Array.isArray(data.users)) saveUsers(data.users);
        if (Array.isArray(data.videos)) saveVideos(data.videos);
        if (Array.isArray(data.pdfs)) savePdfs(data.pdfs);
        if (data.progress && typeof data.progress === 'object') {
          localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data.progress));
        }
        if (Array.isArray(data.news)) saveNews(data.news);
        if (data.banner) saveBanner(data.banner);
        else saveBanner(null);
        logAdmin('Zaxira tiklandi');
        setAdminMessage(message, 'Zaxira tiklandi. Video/PDF fayllari shu brauzerda bo‘lsa ochiladi.', true);
        renderAdmin();
        applyBanner();
      } catch {
        setAdminMessage(message, 'Fayl o‘qilmadi. JSON zaxirani tanlang.');
      }
      event.currentTarget.value = '';
    };
    reader.readAsText(file);
  });

  document.querySelector('#student-modal-close')?.addEventListener('click', () => closeStudentModal());
  document.querySelector('[data-close-student]')?.addEventListener('click', () => closeStudentModal());
  document.querySelector('#student-modal')?.addEventListener('submit', (event) => {
    const form = event.target.closest('#student-bonus-form');
    if (!form) return;
    event.preventDefault();
    const username = form.querySelector('[name="student-bonus-user"]')?.value;
    const points = Number(form.querySelector('[name="student-bonus-points"]')?.value);
    const reason = form.querySelector('[name="student-bonus-reason"]')?.value.trim();
    if (giveBonus(username, points, reason)) {
      openStudentModal(username);
      renderAdmin();
    }
  });

  const closeStudentModal = () => {
    const modal = document.querySelector('#student-modal');
    if (modal) modal.hidden = true;
  };

  const openStudentModal = (username) => {
    const user = findUser(username);
    const modal = document.querySelector('#student-modal');
    const title = document.querySelector('#student-modal-title');
    const body = document.querySelector('#student-modal-body');
    if (!user || !modal || !body) return;
    const stats = getProgressFor(user);
    const videos = readVideos();
    const watched = stats.watchedVideos || [];
    const unitsDone = courses.map((course) => {
      const list = videos.filter((item) => item.subject === course.subject);
      const done = list.filter((item) => watched.includes(item.id)).length;
      return `<div><strong>${done}/${list.length}</strong><span>${course.title}</span></div>`;
    }).join('');
    if (title) title.textContent = user.name || user.username;
    body.innerHTML = `
      <p class="meta">@${user.username} · ${user.blocked ? 'Bloklangan' : 'Faol'} · Ro‘yxat: ${formatDate(user.createdAt)} · Kirgan: ${formatDateTime(user.lastLogin)}</p>
      <div class="student-facts">
        <div><strong>${formatPoints(stats.points)}</strong><span>Ball · ${rankFromPoints(stats.points)}</span></div>
        <div><strong>${stats.streak || 0}</strong><span>Kunlik seriya</span></div>
        <div><strong>${(stats.badges || []).length}</strong><span>Yutuqlar</span></div>
        <div><strong>${(stats.watchedVideos || []).length}</strong><span>Video · ${(stats.openedManuals || []).length} PDF</span></div>
      </div>
      <h3>Kurslar</h3>
      <div class="student-facts">${unitsDone}</div>
      <form class="admin-card-form" id="student-bonus-form">
        <h2>Bonus ball</h2>
        <p>Shu o‘quvchiga ball qo‘shing</p>
        <input type="hidden" name="student-bonus-user" value="${user.username}">
        <label>Ball<input name="student-bonus-points" type="number" min="1" max="5000" value="50" required></label>
        <label>Sabab<input name="student-bonus-reason" type="text" placeholder="Yaxshi natija"></label>
        <button type="submit">Ball berish</button>
      </form>
    `;
    modal.hidden = false;
  };

  adminPanel?.addEventListener('click', async (event) => {
    const userBtn = event.target.closest('[data-delete-user]');
    const videoBtn = event.target.closest('[data-delete-video]');
    const manualBtn = event.target.closest('[data-delete-manual]');
    const openManualBtn = event.target.closest('[data-open-manual]');
    const resetBtn = event.target.closest('[data-reset-progress]');
    const passBtn = event.target.closest('[data-old-reset-pass]');
    const newsBtn = event.target.closest('[data-delete-news]');
    const viewBtn = event.target.closest('[data-view-user]');
    const blockBtn = event.target.closest('[data-block-user]');
    const renameVideoBtn = event.target.closest('[data-rename-video]');
    const renameManualBtn = event.target.closest('[data-rename-manual]');
    if (viewBtn) {
      openStudentModal(viewBtn.dataset.viewUser);
      return;
    }
    if (blockBtn) {
      const login = blockBtn.dataset.blockUser;
      const user = findUser(login);
      if (!user || isAdminUser(user)) return;
      patchUser(login, { blocked: !user.blocked });
      logAdmin(`${user.name || user.username} ${user.blocked ? 'ochildi' : 'bloklandi'}`);
      setAdminMessage(document.querySelector('#admin-user-message'), user.blocked ? 'Hisob ochildi.' : 'Hisob bloklandi.', true);
      renderAdmin();
      return;
    }
    if (renameVideoBtn) {
      const id = renameVideoBtn.dataset.renameVideo;
      const videos = readVideos();
      const video = videos.find((item) => item.id === id);
      if (!video) return;
      const next = window.prompt('Yangi video nomi', video.title);
      if (!next || next.trim().length < 2) return;
      video.title = next.trim();
      saveVideos(videos);
      logAdmin(`Video nomi: ${video.title}`);
      renderAdmin();
      renderStudentVideos();
      return;
    }
    if (renameManualBtn) {
      const id = renameManualBtn.dataset.renameManual;
      const pdfs = readPdfs();
      const item = pdfs.find((pdf) => pdf.id === id);
      if (!item) return;
      const next = window.prompt('Yangi qo‘llanma nomi', item.title);
      if (!next || next.trim().length < 2) return;
      item.title = next.trim();
      savePdfs(pdfs);
      logAdmin(`PDF nomi: ${item.title}`);
      renderAdmin();
      renderStudentManuals();
      return;
    }
    if (openManualBtn) {
      event.preventDefault();
      openPdfModal(openManualBtn.dataset.openManual, openManualBtn.dataset.manualSubject);
      return;
    }
    if (userBtn) {
      const login = userBtn.dataset.deleteUser;
      if (!login || String(login).toLowerCase() === ADMIN_USER.username) return;
      const users = readUsers().filter((user) => String(user.username).toLowerCase() !== String(login).toLowerCase());
      saveUsers(users);
      deleteProgressFor(login);
      logAdmin(`O‘quvchi o‘chirildi: ${login}`);
      renderAdmin();
    } else if (resetBtn) {
      const login = resetBtn.dataset.resetProgress;
      const user = findUser(login);
      if (!user || isAdminUser(user)) return;
      saveProgressFor(user, defaultProgress());
      logAdmin(`${user.name || user.username} ballari 0 qilindi`);
      setAdminMessage(document.querySelector('#admin-user-message'), `${user.name || user.username} ballari 0 ga tushirildi.`, true);
      renderAdmin();
    } else if (passBtn) {
      const login = passBtn.dataset.resetPassUnused;
      const users = readUsers();
      const user = users.find((item) => String(item.username).toLowerCase() === String(login).toLowerCase());
      if (!user || isAdminUser(user)) return;
      user.password = password;
      saveUsers(users);
      setAdminMessage(document.querySelector('#admin-user-message'), `${user.username} paroli: yangi parol`, true);
      renderAdmin();
    } else if (resetBtn) {
      /* handled above */
    } else if (newsBtn) {
      saveNews(readNews().filter((item) => item.id !== newsBtn.dataset.deleteNews));
      renderAdmin();
    } else if (videoBtn) {
      const id = videoBtn.dataset.deleteVideo;
      saveVideos(readVideos().filter((video) => video.id !== id));
      await deleteVideoFile(id);
      logAdmin(`Video o‘chirildi`);
      renderAdmin();
      renderStudentVideos();
    } else if (manualBtn) {
      const id = manualBtn.dataset.deleteManual;
      savePdfs(readPdfs().filter((item) => item.id !== id));
      await deleteVideoFile(id);
      logAdmin('PDF o‘chirildi');
      renderAdmin();
      renderStudentManuals();
    }
  });

  document.querySelector('#pdf-close')?.addEventListener('click', closePdfModal);
  document.querySelector('[data-close-pdf]')?.addEventListener('click', closePdfModal);
});
