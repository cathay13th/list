/* ==========================================================================
   國泰蒔萃 名單管理系統 — 共用主程式
   ========================================================================== */

/* ── 版面：原本寫在 index.html <body> 裡的 HTML，改由這裡注入 ── */
document.body.insertAdjacentHTML('afterbegin', `

<div id="loading-overlay">
  <div class="spinner"></div>
  <div class="loading-text">載入名單資料中…</div>
</div>

<header>
  <div class="logo">
    <div class="logo-dot"></div>
    國泰蒔萃名單管理系統
  </div>
  <div class="header-right">
    <div class="sync-status">
      <div class="sync-dot" id="sync-dot" style="background:var(--warn)"></div>
      <span id="sync-label">連接中…</span>
    </div>
    <button class="btn btn-source" onclick="openLastWeekModal()">🗓️ 上週狀況</button>
    <button class="btn btn-source" onclick="openSourceModal()">📊 來源預約狀況</button>
    <button class="btn btn-primary" onclick="openModal()">＋ 新增名單</button>
  </div>
</header>

<div class="stats-bar" id="stats-bar">
  <div class="stat"><div class="stat-num" id="s-total" style="color:var(--accent)">—</div><div class="stat-label">全部名單</div></div>
  <div class="stat"><div class="stat-num" id="s-visited" style="color:var(--success)">—</div><div class="stat-label">已來訪</div></div>
  <div class="stat"><div class="stat-num" id="s-reserved" style="color:var(--purple)">—</div><div class="stat-label">已預約</div></div>
  <div class="stat"><div class="stat-num" id="s-pending" style="color:var(--info)">—</div><div class="stat-label">待確認</div></div>
  <div class="stat"><div class="stat-num" id="s-missed" style="color:var(--warn)">—</div><div class="stat-label">未接</div></div>
  <div class="stat"><div class="stat-num" id="s-no-need" style="color:var(--danger)">—</div><div class="stat-label">無需求</div></div>
  <div style="width:1px;background:rgba(139,115,85,0.2);margin:4px 0"></div>
  <div class="stat"><div class="stat-num" id="s-lastweek" style="color:var(--text2)">—</div><div class="stat-label">上週名單</div></div>
  <div class="stat"><div class="stat-num" id="s-today-dispatch" style="color:var(--accent2)">—</div><div class="stat-label">當日派發名單</div></div>
  <div class="stat stat-revisit" onclick="filterRevisit()" title="歸屬期內重複留單且尚未派發，點擊篩選／再點一次還原">
    <div class="stat-num" id="s-revisit" style="color:var(--text3)">—</div>
    <div class="stat-label">🔁 重複名單</div>
  </div>
  <div class="stat">
    <div class="stat-num" id="s-week" style="color:var(--accent)">—</div>
    <div class="stat-label">本週新增</div>
  </div>
  <div class="stat" style="min-width:140px">
    <div class="stat-label">本週名單來源</div>
    <div class="stat-media-breakdown font-lg" id="s-week-media"></div>
  </div>
  <div class="stat" style="min-width:200px">
    <div class="stat-label">本週聯絡狀況</div>
    <div class="stat-media-breakdown large" id="s-week-status"></div>
  </div>
</div>

<div class="toolbar">
  <input class="search-box" type="text" id="search" placeholder="搜尋姓名、電話、備註…" oninput="renderTable()">
  <select class="filter" id="f-status" onchange="renderTable()">
    <option value="">全部狀況</option>
    <option>待確認</option>
    <option>未接</option>
    <option>已來訪</option>
    <option>已預約</option>
    <option>無需求</option>
    <option>空號</option>
  </select>
  <select class="filter" id="f-agent" onchange="renderTable()">
    <option value="">全部業務</option>
  </select>
  <select class="filter" id="f-media" onchange="renderTable()">
    <option value="">全部媒體</option>
  </select>
  <select class="filter" id="f-dup" onchange="renderTable()">
    <option value="">全部名單</option>
    <option value="dup">🔁 只看重複留單</option>
    <option value="dup-active">🔁 只看歸屬期內重複</option>
    <option value="revisit">🔁 只看重複名單（未派發）</option>
  </select>
  <select class="filter" id="f-year-filter" onchange="renderTable()">
    <option value="">全部年份</option>
  </select>
  <select class="filter" id="f-date" onchange="renderTable()">
    <option value="">全部日期</option>
  </select>
  <button class="btn" id="btn-handover" onclick="toggleHandover()" style="display:none">📋 交接名單</button>
  <button class="btn" onclick="clearFilters()">清除篩選</button>
  <button class="btn" onclick="exportCSV()">匯出 CSV</button>
</div>

<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>年份</th>
        <th>日期 ↓</th>
        <th onclick="sortBy('name')">姓名 <span id="sort-name"></span></th>
        <th onclick="sortBy('phone')">電話</th>
        <th onclick="sortBy('region')">區域</th>
        <th onclick="sortBy('status')">聯絡狀況</th>
        <th onclick="sortBy('media')">媒體</th>
        <th onclick="sortBy('agent')">跑單</th>
        <th onclick="sortBy('dispatch')">派發日 <span id="sort-dispatch"></span></th>
        <th onclick="sortBy('apptDate')">預約日期 <span id="sort-apptDate"></span></th>
        <th onclick="sortBy('apptTime')">預約時間 <span id="sort-apptTime"></span></th>
        <th>詳細狀況</th>
        <th></th>
      </tr>
    </thead>
    <tbody id="tbody"></tbody>
  </table>
  <div id="empty-state" class="empty-state" style="display:none">
    <div class="empty-icon">📋</div>
    <div>沒有符合條件的名單</div>
  </div>
</div>

<div class="pagination" id="pagination">
  <div id="page-info"></div>
  <div class="page-btns" id="page-btns"></div>
</div>

<!-- MODAL -->
<div class="modal-overlay" id="modal" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title" id="modal-title">新增聯絡人</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="dup-warn" id="fg-dup" style="display:none"></div>
        <div class="form-group full" id="fg-ad-campaign" style="display:none">
          <label class="form-label">🏷️ 廣告來源活動（唯讀）</label>
          <div id="f-ad-campaign-display" style="background:rgba(139,99,64,0.08);border:1px solid var(--border2);border-radius:6px;padding:6px 10px;color:var(--accent);font-size:12px;font-weight:500;line-height:1.5;word-break:break-word;max-height:54px;overflow-y:auto;"></div>
        </div>
        <div class="form-group">
          <label class="form-label">年份</label>
          <input class="form-input" type="number" id="f-year" placeholder="2024" min="2020" max="2099">
        </div>
        <div class="form-group">
          <label class="form-label">日期</label>
          <input class="form-input" type="text" id="f-date-input" placeholder="12/20">
        </div>
        <div class="form-group">
          <label class="form-label">姓名 *</label>
          <input class="form-input" type="text" id="f-name" placeholder="姓名">
        </div>
        <div class="form-group">
          <label class="form-label">電話 *</label>
          <input class="form-input" type="tel" id="f-phone" placeholder="09xxxxxxxx" oninput="checkDuplicate()">
        </div>
        <div class="form-group">
          <label class="form-label">區域</label>
          <input class="form-input" type="text" id="f-region" placeholder="臺中市" list="region-list">
          <datalist id="region-list"></datalist>
        </div>
        <div class="form-group">
          <label class="form-label">聯絡狀況</label>
          <select class="form-select" id="f-contact-status" onchange="toggleApptField()">
            <option value="">—</option>
            <option>待確認</option>
            <option>未接</option>
            <option>已來訪</option>
            <option>已預約</option>
            <option>無需求</option>
            <option>空號</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">媒體</label>
          <select class="form-select" id="f-media-input">
            <option value="">請選擇媒體</option>
            <option>FB</option>
            <option>Google</option>
            <option>591</option>
            <option>Line</option>
            <option>國建官網</option>
            <option>創意家官網</option>
            <option>POP</option>
            <option>路過</option>
            <option>親友/客戶介紹</option>
            <option>霖園集團介紹</option>
            <option>來電</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">跑單業務</label>
          <input class="form-input" type="text" id="f-agent-input" placeholder="業務姓名" list="agent-list" oninput="autoFillDispatch()">
          <datalist id="agent-list"></datalist>
        </div>
        <div class="form-group">
          <label class="form-label">派發日</label>
          <input class="form-input" type="text" id="f-dispatch" placeholder="5/19">
        </div>

        <div class="appt-section" id="fg-appt">
          <div class="appt-section-title">📅 預約資訊</div>
          <div class="form-group">
            <label class="form-label">預約日期</label>
            <input class="form-input" type="text" id="f-appt-date" placeholder="5/17">
          </div>
          <div class="form-group">
            <label class="form-label">預約時間</label>
            <input class="form-input" type="time" id="f-appt-time">
          </div>
        </div>

        <div class="form-group full">
          <label class="form-label">詳細狀況 / 備註</label>
          <textarea class="form-textarea" id="f-notes" placeholder="填入備註…"></textarea>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-danger" id="btn-delete" onclick="deleteRecord()" style="display:none;margin-right:auto">刪除</button>
      <button class="btn" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="saveRecord()">儲存</button>
    </div>
  </div>
</div>

<!-- 來源預約狀況 MODAL -->
<div class="modal-overlay" id="source-modal" onclick="if(event.target===this)closeSourceModal()">
  <div class="modal source-modal">
    <div class="modal-header">
      <div class="modal-title">📊 名單來源預約狀況</div>
      <button class="modal-close" onclick="closeSourceModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="source-toolbar">
        <div class="source-toggle">
          <button id="src-tab-week" class="active" onclick="setSourceScope('week')">本週派發</button>
          <button id="src-tab-lastweek" onclick="setSourceScope('lastweek')">上週派發</button>
          <button id="src-tab-all" onclick="setSourceScope('all')">全部累積</button>
        </div>
        <div class="source-summary" id="source-summary"></div>
      </div>
      <div class="source-list" id="source-list"></div>
    </div>
  </div>
</div>

<!-- 上週狀況 MODAL -->
<div class="modal-overlay" id="lastweek-modal" onclick="if(event.target===this)closeLastWeekModal()">
  <div class="modal source-modal">
    <div class="modal-header">
      <div class="modal-title">🗓️ 上週名單狀況</div>
      <button class="modal-close" onclick="closeLastWeekModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="lw-range" id="lw-range"></div>
      <div class="lw-section">
        <div class="lw-title">聯絡狀況</div>
        <div class="lw-items" id="lw-status"></div>
      </div>
      <div class="lw-section">
        <div class="lw-title">名單來源</div>
        <div class="lw-tablewrap" id="lw-media"></div>
      </div>
      <div class="lw-section">
        <div class="lw-title">名單區域</div>
        <div class="lw-items" id="lw-region"></div>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>
`);


// ⚠️ Apps Script 的部署網址（已填入完整正確網址）
const API_URL = 'https://script.google.com/macros/s/AKfycbz59t8cGnTBH-Kb4t6NuSjv8OO53MjRuw360C7IrkrCbxMxe1813fo8QRLyD43A-_kozw/exec';
const FORCE_AGENT = (typeof window.FORCE_AGENT === 'string') ? window.FORCE_AGENT : '';
const HANDOVER_TAG = '[原:離職業務姓名]';
const HANDOVER_START = new Date('2000-01-01T00:00:00+08:00');
let handoverOnly = false;
const CURRENT_YEAR = 2026;
let records = [];
let editingId = null;
let sortCol = 'date';
let sortAsc = false;
let userSortActive = false;
let LOCKED_AGENT = null;
let page = 1;
const PAGE_SIZE = 50;

// ─── 電話號碼中間碼遮蔽 ───
function maskPhone(p) {
  if (!p) return '—';
  const s = String(p).trim();
  if (s.length === 10) {
    return s.slice(0, 4) + '***' + s.slice(7);
  } else if (s.length > 6) {
    return s.slice(0, 3) + '***' + s.slice(-3);
  }
  return s;
}

// ─── 解析舊格式預約欄位 ───
function parseApptLegacy(raw) {
  if (!raw) return { date: '', time: '' };
  const s = String(raw).trim();
  if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d)) {
      const dateStr = (d.getMonth()+1) + '/' + d.getDate();
      const h = d.getHours(), mi = d.getMinutes();
      const timeStr = (h !== 0 || mi !== 0)
        ? String(h).padStart(2,'0') + ':' + String(mi).padStart(2,'0')
        : '';
      return { date: dateStr, time: timeStr };
    }
  }
  const cnPmMatch = s.match(/^(\d{1,2}\/\d{1,2})[下午後]{0,2}(\d{1,2}:\d{2})/);
  if (cnPmMatch) return { date: cnPmMatch[1], time: cnPmMatch[2] };
  const stdMatch = s.match(/^([\d\/]+)\s+(\d{1,2}:\d{2})/);
  if (stdMatch) return { date: stdMatch[1], time: stdMatch[2] };
  if (/^\d{1,2}\/\d{1,2}$/.test(s) || /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(s)) {
    return { date: s, time: '' };
  }
  return { date: s, time: '' };
}

// ─── 媒體名稱同義詞清洗與對照 (Mapping) ───
function normalizeMediaName(m) {
  if (!m || m === 'null') return '未填';
  let s = String(m).trim().replace(/\s+/g, ''); // 移除多餘空白
  let lower = s.toLowerCase();

  // 1. FB 廣告系列
  if (/^fb/i.test(lower) || lower.includes('facebook')) return 'FB';
  
  // 2. Google
  if (lower.includes('google')) return 'Google';
  
  // 3. 591
  if (s.includes('591')) return '591';
  
  // 4. Line
  if (/^line/i.test(lower)) return 'Line';
  
  // 5. 官網類
  if (s.includes('創意家官網')) return '創意家官網';
  if (s.includes('國建官網') || s === '官網') return '國建官網';
  
  // 6. POP 類（基地/工地/POP來電等）
  if (s.includes('pop') || s.includes('基地') || s.includes('工地')) return 'POP';
  
  // 7. 路過
  if (s.includes('路過')) return '路過';
  
    // 8. 霖園集團介紹（先判斷是否有集團關鍵字）
  if (s.includes('國泰') || s.includes('霖園')) return '霖園集團介紹';

  // 9. 親友/客戶介紹（其餘帶有「介紹」的歸此類）
  if (s.includes('介紹')) return '親友/客戶介紹';

  
  // 10. 來電類
  if (s.includes('來電')) return '來電';

  return s; // 若有特殊例外則保留原字串
}

function normalizeRecord(r) {
  if (r.apptTime) {
    const t = String(r.apptTime).trim();
    if (/1899/.test(t) || /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test(t)) {
      const d = new Date(t);
      if (!isNaN(d)) {
        r.apptTime = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      } else {
        r.apptTime = '';
      }
    }
  }
  const raw = String(r.apptDate || r.appt || '').trim();
  if (raw) {
    const isCleanDate = /^\d{1,4}\/\d{1,2}(\/\d{1,2})?$/.test(raw);
    if (!isCleanDate) {
      const parsed = parseApptLegacy(raw);
      r.apptDate = parsed.date;
      if (!r.apptTime) r.apptTime = parsed.time;
    }
  } else {
    r.apptDate = '';
  }

  // 自動清洗與統一媒體名稱
  r.media = normalizeMediaName(r.media);

  r.apptTime = r.apptTime || '';
  return r;
}

// ─── GOOGLE SHEETS API ───
async function loadData() {
  setSyncStatus('loading');
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    if (json.ok) {
      records = json.data.filter(r => r.name && r.name !== '__deleted__').map(r => normalizeRecord(r));
      setSyncStatus('ok');
    } else {
      throw new Error('API error');
    }
  } catch(e) {
    setSyncStatus('error');
    showToast('無法連線到 Google Sheets，請確認網路', 'error');
    records = [];
  }
}

async function apiCall(action, record) {
  setSyncStatus('loading');
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action, record })
    });
    const json = await res.json();
    setSyncStatus('ok');
    return json;
  } catch(e) {
    setSyncStatus('error');
    showToast('儲存失敗，請確認網路連線', 'error');
    return null;
  }
}

function setSyncStatus(state) {
  const dot = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  if (state === 'ok') {
    dot.style.background = 'var(--success)';
    label.textContent = 'Google Sheets 同步中';
  } else if (state === 'loading') {
    dot.style.background = 'var(--warn)';
    label.textContent = '同步中…';
  } else {
    dot.style.background = 'var(--danger)';
    label.textContent = '連線失敗';
  }
}

function dateToNum(dateStr) {
  const parts = (dateStr || '').split('/').map(Number);
  return (parts[0] || 0) * 100 + (parts[1] || 0);
}

// ─── 重複留單偵測 ───
const OWNERSHIP_DAYS = 180;
let phoneIndex = {};

function normPhone(v) {
  if (v === null || v === undefined) return '';
  let t = String(v).trim();
  if (/\.0$/.test(t)) t = t.slice(0, -2);
  t = t.replace(/[^0-9]/g, '');
  if (!t) return '';
  if (t.startsWith('886')) t = '0' + t.slice(3);
  if (!t.startsWith('0')) t = '0' + t;
  return t;
}

function recDate(r) {
  const parts = String(r.date || '').split('/').map(Number);
  const y = parseInt(r.year || 0);
  if (!y || !parts[0] || !parts[1]) return null;
  return new Date(y, parts[0] - 1, parts[1]);
}

function buildPhoneIndex() {
  phoneIndex = {};
  records.forEach(r => {
    const p = normPhone(r.phone);
    if (!p || p.length < 9) return;
    (phoneIndex[p] = phoneIndex[p] || []).push(r);
  });
}

function getDupRecords(phone, excludeId) {
  const p = normPhone(phone);
  if (!p || p.length < 9) return [];
  return (phoneIndex[p] || [])
    .filter(r => r.id !== excludeId)
    .sort((a, b) => {
      const da = recDate(a), db = recDate(b);
      return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
    });
}

function daysAgo(d) {
  if (!d) return null;
  return Math.floor((new Date().setHours(0,0,0,0) - d.setHours(0,0,0,0)) / 86400000);
}

function hasActiveDup(r) {
  return getDupRecords(r.phone, r.id).some(o => {
    const dd = daysAgo(recDate(o));
    return dd !== null && dd <= OWNERSHIP_DAYS;
  });
}

function isPendingRevisit(r) {
  if (parseInt(r.year || 0) < CURRENT_YEAR) return false;
  if (String(r.dispatch || '').trim()) return false;
  return hasActiveDup(r);
}

function getWeekRange(offset) {
  const now = new Date();
  const day = now.getDay() || 7;
  const mon = new Date(now); mon.setDate(now.getDate() - day + 1 + offset*7);
  mon.setHours(0,0,0,0);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  sun.setHours(23,59,59,999);
  return { mon, sun };
}

function inDispatchWeek(r, mon, sun) {
  const dispStr = r.dispatch || "";
  const parts = dispStr.split("/");
  if (parts.length < 2) return false;
  const yr = parseInt(r.year || 0) || new Date().getFullYear();
  const d = new Date(yr, parseInt(parts[0])-1, parseInt(parts[1]));
  return d >= mon && d <= sun;
}

function defaultSort(a, b) {
  const aIsOld = parseInt(a.year || 0) < CURRENT_YEAR;
  const bIsOld = parseInt(b.year || 0) < CURRENT_YEAR;
  if (aIsOld !== bIsOld) return aIsOld ? 1 : -1;
  if (!aIsOld && !bIsOld) {
    const aNoDispatch = !a.dispatch;
    const bNoDispatch = !b.dispatch;
    if (aNoDispatch !== bNoDispatch) return aNoDispatch ? -1 : 1;
  }
  const ya = parseInt(a.year || 0), yb = parseInt(b.year || 0);
  if (ya !== yb) return yb - ya;
  return dateToNum(b.date) - dateToNum(a.date);
}

function userSort(a, b, col, asc) {
  const aIsOld = parseInt(a.year || 0) < CURRENT_YEAR;
  const bIsOld = parseInt(b.year || 0) < CURRENT_YEAR;
  if (aIsOld !== bIsOld) return aIsOld ? 1 : -1;

  let av = a[col] || '', bv = b[col] || '';
  if (col === 'date' || col === 'dispatch') {
    const fa = col === 'date' ? (a.date || '') : (a.dispatch || '');
    const fb = col === 'date' ? (b.date || '') : (b.dispatch || '');
    const da = dateToNum(fa), db = dateToNum(fb);
    return asc ? da - db : db - da;
  }
  return asc ? av.localeCompare(bv, 'zh-TW') : bv.localeCompare(av, 'zh-TW');
}

function getFiltered() {
  const q = document.getElementById('search').value.toLowerCase();
  const fStatus = document.getElementById('f-status').value;
  const fAgent = document.getElementById('f-agent').value;
  const fMedia = document.getElementById('f-media').value;
  const fDate = document.getElementById('f-date').value;
  const fYear = document.getElementById('f-year-filter').value;
  const fDupEl = document.getElementById('f-dup');
  const fDup = fDupEl ? fDupEl.value : '';

  const filtered = records.filter(r => {
    if (LOCKED_AGENT && String(r.agent || '').trim() !== LOCKED_AGENT) return false;
    if (q && !`${r.name}${r.phone}${r.notes}${r.region}${r.agent}`.toLowerCase().includes(q)) return false;
    if (fStatus && r.status !== fStatus) return false;
    if (fAgent && r.agent !== fAgent) return false;
    if (fMedia && r.media !== fMedia) return false;
    if (fDate && r.date !== fDate) return false;
    if (fYear && r.year !== fYear) return false;
    if (fDup === 'dup' && getDupRecords(r.phone, r.id).length === 0) return false;
    if (fDup === 'dup-active' && !hasActiveDup(r)) return false;
    if (fDup === 'revisit' && !isPendingRevisit(r)) return false;
    if (handoverOnly && !String(r.notes || '').includes(HANDOVER_TAG)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (userSortActive) return userSort(a, b, sortCol, sortAsc);
    return defaultSort(a, b);
  });

  return filtered;
}

function sortBy(col) {
  if (sortCol === col) sortAsc = !sortAsc;
  else { sortCol = col; sortAsc = false; }
  userSortActive = true;
  page = 1;
  renderTable();
}

function clearFilters() {
  handoverOnly = false;
  document.getElementById('search').value = '';
  document.getElementById('f-status').value = '';
  document.getElementById('f-agent').value = '';
  document.getElementById('f-media').value = '';
  document.getElementById('f-date').value = '';
  document.getElementById('f-year-filter').value = '';
  const fd = document.getElementById('f-dup'); if (fd) fd.value = '';
  sortCol = 'date';
  sortAsc = false;
  userSortActive = false;
  page = 1;
  renderTable();
}

function filterRevisit() {
  const fd = document.getElementById('f-dup');
  if (fd && fd.value === 'revisit') {
    clearFilters();
    showToast('已還原全部名單', 'success');
    return;
  }
  handoverOnly = false;
  document.getElementById('search').value = '';
  document.getElementById('f-status').value = '';
  document.getElementById('f-agent').value = '';
  document.getElementById('f-media').value = '';
  document.getElementById('f-date').value = '';
  document.getElementById('f-year-filter').value = '';
  fd.value = 'revisit';
  sortCol = 'date';
  sortAsc = false;
  userSortActive = false;
  page = 1;
  renderTable();
  const n = records.filter(isPendingRevisit).length;
  showToast(n ? `已篩出 ${n} 筆重複名單，再點一次還原` : '目前沒有未派發的重複名單', n ? 'success' : 'error');
  document.querySelector('.table-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function countHandover() {
  return records.filter(r =>
    (!LOCKED_AGENT || String(r.agent || '').trim() === LOCKED_AGENT) &&
    String(r.notes || '').includes(HANDOVER_TAG)
  ).length;
}

function apptToDate(r) {
  const s = String(r.apptDate || '').trim();
  if (!s) return null;
  const p = s.split('/').map(x => parseInt(x, 10));
  if (p.some(isNaN)) return null;
  const now = new Date();
  let d;
  if (p.length >= 3) {
    d = new Date(p[0], p[1] - 1, p[2]);
  } else if (p.length === 2) {
    d = new Date(now.getFullYear(), p[0] - 1, p[1]);
    const diff = (d - now) / 86400000;
    if (diff > 183) d.setFullYear(d.getFullYear() - 1);
    else if (diff < -183) d.setFullYear(d.getFullYear() + 1);
  } else {
    return null;
  }
  if (isNaN(d)) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function updateAgentStats() {
  const box = document.getElementById('agent-week-stats');
  if (!box) return;

  const mine = records.filter(r =>
    !LOCKED_AGENT || String(r.agent || '').trim() === LOCKED_AGENT
  );
  const { mon, sun } = getWeekRange(0);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const booked = mine.filter(r => inDispatchWeek(r, mon, sun) && apptToDate(r)).length;
  const visits = mine.filter(r => {
    const d = apptToDate(r);
    return d && d >= mon && d <= sun;
  });
  const upcoming = visits.filter(r => apptToDate(r) >= today).length;

  box.innerHTML =
    '<span class="aw-item"><span class="aw-label">本週約訪</span>'
    + '<span class="aw-num">' + booked + '</span></span>'
    + '<span class="aw-sep"></span>'
    + '<span class="aw-item"><span class="aw-label">本週到訪</span>'
    + '<span class="aw-num">' + visits.length + '</span>'
    + (upcoming > 0
        ? '<span class="aw-sub">今天起還有 ' + upcoming + ' 組</span>'
        : (visits.length ? '<span class="aw-sub aw-done">本週已跑完</span>' : ''))
    + '</span>';
}

function updateHandoverBtn() {
  if (new Date() < HANDOVER_START) {
    handoverOnly = false;
    ['btn-handover', 'btn-handover-agent'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.style.display = 'none';
    });
    return;
  }
  const n = countHandover();
  ['btn-handover', 'btn-handover-agent'].forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    if (n === 0) { b.style.display = 'none'; return; }
    b.style.display = '';
    b.textContent = '📋 交接名單 ' + n;
    b.classList.toggle('handover-on', handoverOnly);
  });
}

function toggleHandover() {
  if (new Date() < HANDOVER_START) return;
  const n = countHandover();
  if (!handoverOnly && n === 0) { showToast('目前沒有交接名單', 'error'); return; }
  handoverOnly = !handoverOnly;
  document.getElementById('search').value = '';
  document.getElementById('f-status').value = '';
  const sa = document.getElementById('search-agent'); if (sa) sa.value = '';
  const ssa = document.getElementById('f-status-agent'); if (ssa) ssa.value = '';
  const fm = document.getElementById('f-media'); if (fm) fm.value = '';
  const fdt = document.getElementById('f-date'); if (fdt) fdt.value = '';
  const fy = document.getElementById('f-year-filter'); if (fy) fy.value = '';
  const fdup = document.getElementById('f-dup'); if (fdup) fdup.value = '';
  const fag = document.getElementById('f-agent'); if (fag && !LOCKED_AGENT) fag.value = '';
  sortCol = 'date';
  sortAsc = false;
  userSortActive = false;
  page = 1;
  renderTable();
  showToast(handoverOnly ? '只顯示交接名單 ' + n + ' 筆，再點一次還原' : '已還原全部名單', 'success');
  document.querySelector('.table-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStatusBreakdown(elId, recs, emptyText) {
  const el = document.getElementById(elId);
  if (!el) return;
  const count = {};
  recs.forEach(r => {
    const s = r.status || '未填寫';
    count[s] = (count[s] || 0) + 1;
  });
  const items = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([s, c]) => `${s}${c}`);
  if (items.length) {
    const rows = [];
    for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
    el.innerHTML = rows.map(row =>
      `<div class="breakdown-row">${row.map((t, i) => `<span>${esc(t)}${i < row.length - 1 ? '、' : ''}</span>`).join('')}</div>`
    ).join('');
  } else {
    el.innerHTML = '<div class="breakdown-row"><span>—</span></div>';
  }
  el.title = items.join('、') || emptyText;
}

// ─── 渲染列表 ───
function renderTable() {
  buildPhoneIndex();
  const filtered = getFiltered();
  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  if (page > totalPages) page = totalPages;
  const slice = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const sTotal = document.getElementById('s-total');
  if (sTotal) {
    sTotal.textContent = records.length;
    document.getElementById('s-visited').textContent = records.filter(r=>r.status==='已來訪').length;
    document.getElementById('s-reserved').textContent = records.filter(r=>r.status==='已預約').length;
    document.getElementById('s-pending').textContent = records.filter(r=>r.status==='待確認').length;
    document.getElementById('s-missed').textContent = records.filter(r=>r.status==='未接').length;
    document.getElementById('s-no-need').textContent = records.filter(r=>r.status==='無需求').length;
    const thisWeek = getWeekRange(0);
    const lastWeek = getWeekRange(-1);
    const thisWeekRecords = records.filter(r => inDispatchWeek(r, thisWeek.mon, thisWeek.sun));
    const lastWeekRecords = records.filter(r => inDispatchWeek(r, lastWeek.mon, lastWeek.sun));
    document.getElementById('s-week').textContent = thisWeekRecords.length;
    document.getElementById('s-lastweek').textContent = lastWeekRecords.length;

    const today = new Date();
    const todayStr = (today.getMonth()+1) + '/' + today.getDate();
    const thisYear = today.getFullYear();
    document.getElementById('s-today-dispatch').textContent = records.filter(r =>
      (r.dispatch || '').trim() === todayStr && parseInt(r.year || 0) === thisYear
    ).length;

    const revisitCount = records.filter(isPendingRevisit).length;
    const revEl = document.getElementById('s-revisit');
    if (revEl) {
      revEl.textContent = revisitCount;
      revEl.style.color = revisitCount > 0 ? 'var(--danger)' : 'var(--text3)';
      revEl.style.fontWeight = revisitCount > 0 ? '700' : '600';
    }

    renderStatusBreakdown('s-week-status', thisWeekRecords, '本週尚無名單');

    const mediaCount = {};
    thisWeekRecords.forEach(r => {
      const m = normalizeMediaName(r.media);
      mediaCount[m] = (mediaCount[m] || 0) + 1;
    });
    const mediaItems = Object.entries(mediaCount)
      .sort((a, b) => b[1] - a[1])
      .map(([m, c]) => `${m}${c}`);
    const mediaEl = document.getElementById('s-week-media');
    if (mediaEl) {
      if (mediaItems.length) {
        mediaEl.innerHTML = mediaItems.map((t, i) => `<span>${esc(t)}${i < mediaItems.length - 1 ? '、' : ''}</span>`).join('');
      } else {
        mediaEl.innerHTML = '<span>—</span>';
      }
      mediaEl.title = mediaItems.join('、') || '本週尚無新增名單';
    }
  }

  populateFilters();

  const tbody = document.getElementById('tbody');
  if (slice.length === 0) {
    tbody.innerHTML = '';
    document.getElementById('empty-state').style.display = 'block';
  } else {
    document.getElementById('empty-state').style.display = 'none';

    let html = '';
    let lastYear = null;

    slice.forEach(r => {
      const yr = r.year || '—';
      const isOld = parseInt(r.year || 0) < CURRENT_YEAR;
      const isNewUnassigned = !isOld && !r.dispatch;

      if (yr !== lastYear) {
        const label = isOld ? `▾ ${yr} 年舊名單` : `▾ ${yr} 年`;
        html += `<tr class="year-divider"><td colspan="13">${label}</td></tr>`;
        lastYear = yr;
      }

      const dups = getDupRecords(r.phone, r.id);
      const activeDup = dups.some(o => { const dd = daysAgo(recDate(o)); return dd !== null && dd <= OWNERSHIP_DAYS; });
      const dupFlag = dups.length
        ? `<span class="dup-flag ${activeDup ? '' : 'expired'}" title="${activeDup ? '歸屬期內重複留單，派發前請先確認原業務' : '過去曾留單（已超過歸屬期）'}">🔁${dups.length + 1}</span>`
        : '';

      const rowClass = (isOld ? 'old-year' : (isNewUnassigned ? 'new-unassigned' : '')) + (activeDup ? ' dup-row' : '');
      html += `
        <tr class="${rowClass}" onclick="openModal('${r.id}')">
          <td style="color:var(--text3);font-size:12px">${esc(yr)}</td>
          <td style="color:var(--text2);font-size:12px">${r.date || '—'}</td>
          <td style="font-weight:500">${esc(r.name)}${dupFlag}</td>
          <td style="font-family:monospace;color:var(--text2)">${esc(maskPhone(r.phone))}</td>
          <td style="color:var(--text2)">${esc(r.region)}</td>
          <td>${badgeHtml(r.status)}</td>
          <td style="color:var(--text2)">${esc(r.media)}</td>
          <td style="color:var(--text2)">${esc(r.agent)}</td>
          <td style="color:var(--text2);font-size:12px">${r.dispatch ? esc(r.dispatch) : '<span style="color:var(--warn);font-weight:600">未派發</span>'}</td>
          <td class="appt-col"><span class="appt-date">${esc(r.apptDate) || '<span style="color:var(--text3)">—</span>'}</span></td>
          <td class="appt-col"><span class="appt-time" style="font-size:13px;color:var(--purple)">${esc(r.apptTime) || '<span style="color:var(--text3)">—</span>'}</span></td>
          <td class="notes-col" title="${esc(r.notes)}">${esc(r.notes)}</td>
          <td style="width:24px;text-align:center;color:var(--text3);font-size:16px">›</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  document.getElementById('page-info').textContent = `共 ${total} 筆，第 ${page}/${totalPages} 頁`;
  const pbDiv = document.getElementById('page-btns');
  let btns = '';
  btns += `<button class="page-btn" onclick="changePage(${page-1})" ${page<=1?'disabled':''}>‹</button>`;
  for (let i = Math.max(1,page-2); i <= Math.min(totalPages,page+2); i++) {
    btns += `<button class="page-btn ${i===page?'active':''}" onclick="changePage(${i})">${i}</button>`;
  }
  btns += `<button class="page-btn" onclick="changePage(${page+1})" ${page>=totalPages?'disabled':''}>›</button>`;
  pbDiv.innerHTML = btns;

  ['name','phone','region','status','media','agent','dispatch','apptDate','apptTime'].forEach(c => {
    const el = document.getElementById('sort-'+c);
    if (el) el.textContent = sortCol===c ? (sortAsc?'↑':'↓') : '';
  });

  updateHandoverBtn();
  updateAgentStats();
}

function changePage(p) {
  const filtered = getFiltered();
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  page = Math.max(1, Math.min(p, totalPages));
  renderTable();
}

function populateFilters() {
  const agents = [...new Set(records.map(r=>r.agent).filter(Boolean))].sort();
  const medias = [...new Set(records.map(r=>r.media).filter(Boolean))].sort();
  const dates = [...new Set(records.map(r => r.year + '|' + r.date).filter(r => r.includes('/')))].sort((a,b) => {
    const [ay,ad] = a.split('|'); const [by,bd] = b.split('|');
    const [am,adm] = (ad||'').split('/').map(Number); const [bm,bdm] = (bd||'').split('/').map(Number);
    return (parseInt(by)||0)*10000+(bm||0)*100+(bdm||0) - ((parseInt(ay)||0)*10000+(am||0)*100+(adm||0));
  }).map(x => x.split('|')[1]);
  const regions = [...new Set(records.map(r=>r.region).filter(Boolean))].sort();
  const years = [...new Set(records.map(r=>r.year).filter(Boolean))].sort().reverse();

  const fyEl = document.getElementById('f-year-filter');
  const curY = fyEl.value;
  fyEl.innerHTML = '<option value="">全部年份</option>' + years.map(y=>`<option ${y===curY?'selected':''}>${y}</option>`).join('');

  const fa = document.getElementById('f-agent');
  const curA = fa.value;
  fa.innerHTML = '<option value="">全部業務</option>' + agents.map(a=>`<option ${a===curA?'selected':''}>${a}</option>`).join('');

  const fm = document.getElementById('f-media');
  const curM = fm.value;
  fm.innerHTML = '<option value="">全部媒體</option>' + medias.map(m=>`<option ${m===curM?'selected':''}>${m}</option>`).join('');

  const fd = document.getElementById('f-date');
  const curD = fd.value;
  fd.innerHTML = '<option value="">全部日期</option>' + dates.map(d=>`<option ${d===curD?'selected':''}>${d}</option>`).join('');

  document.getElementById('agent-list').innerHTML = agents.map(a=>`<option value="${a}">`).join('');
  document.getElementById('region-list').innerHTML = regions.map(r=>`<option value="${r}">`).join('');
}

function badgeHtml(status) {
  if (!status) return '<span style="color:var(--text3)">—</span>';
  const cls = ['待確認','未接','已來訪','已預約','無需求','空號'].includes(status) ? 'badge-'+status : 'badge-default';
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ─── 來源預約狀況 ───
let sourceScope = 'week';

function reorderCampaign(name) {
  const s = String(name || '').trim();
  if (!s) return s;
  const m = s.match(/(\d{2,})/);
  if (!m) return s;
  const num = m[1];
  const rest = s.replace(num, '').trim();
  return num + rest;
}

function getSourceStats(scope) {
  const wk = getWeekRange(0);
  const lwk = getWeekRange(-1);
  const groups = {};
  records.forEach(r => {
    const src = (r.adCampaign || '').trim();
    if (!src) return;
    const inWeek = inDispatchWeek(r, wk.mon, wk.sun);
    const inLastWeek = inDispatchWeek(r, lwk.mon, lwk.sun);
    if (scope === 'week' && !inWeek) return;
    if (scope === 'lastweek' && !inLastWeek) return;
    if (!groups[src]) groups[src] = { name: src, count: 0, weekCount: 0, lastWeekCount: 0, status: {} };
    groups[src].count++;
    const st = r.status || '未填寫';
    groups[src].status[st] = (groups[src].status[st] || 0) + 1;
    if (inWeek) groups[src].weekCount++;
    if (inLastWeek) groups[src].lastWeekCount++;
  });
  return Object.values(groups)
    .map(g => Object.assign(g, { display: reorderCampaign(g.name) }))
    .sort((a, b) => {
      const na = parseInt((a.display.match(/^\d+/) || ['0'])[0], 10);
      const nb = parseInt((b.display.match(/^\d+/) || ['0'])[0], 10);
      if (na !== nb) return nb - na;
      return a.display.localeCompare(b.display, 'zh-Hant');
    });
}

const STATUS_ORDER = ['已預約','已來訪','待確認','未接','無需求','空號','未填寫'];

function renderSourceStats() {
  const stats = getSourceStats(sourceScope);
  const listEl = document.getElementById('source-list');
  const sumEl = document.getElementById('source-summary');

  const totalSources = stats.length;
  const totalCount = stats.reduce((s, g) => s + g.count, 0);
  const scopeLabel = sourceScope === 'week' ? '本週派發' : sourceScope === 'lastweek' ? '上週派發' : '全部累積';
  sumEl.textContent = `共 ${totalSources} 個來源、${totalCount} 筆名單（${scopeLabel}）`;

  if (!stats.length) {
    listEl.innerHTML = '<div class="source-empty">此範圍內沒有帶廣告來源的名單</div>';
    return;
  }

  const badgeLabel = sourceScope === 'lastweek' ? '上週名單' : '本週名單';
  listEl.innerHTML = stats.map(g => {
    const items = STATUS_ORDER
      .filter(st => g.status[st])
      .map(st => {
        const cls = ['待確認','未接','已來訪','已預約','無需求','空號'].includes(st) ? 'badge-'+st : 'badge-default';
        return `<span class="badge ${cls}">${esc(st)} ${g.status[st]}</span>`;
      }).join('');
    return `
      <div class="source-item">
        <div class="source-item-top">
          <div class="source-name">${esc(g.display)}</div>
          <div class="source-week-badge">${badgeLabel} ${sourceScope === 'lastweek' ? g.lastWeekCount : g.weekCount}</div>
        </div>
        <div class="source-stats">${items || '<span class="badge badge-default">尚無狀況</span>'}</div>
      </div>
    `;
  }).join('');
}

function setSourceScope(scope) {
  sourceScope = scope;
  document.getElementById('src-tab-week').classList.toggle('active', scope === 'week');
  document.getElementById('src-tab-lastweek').classList.toggle('active', scope === 'lastweek');
  document.getElementById('src-tab-all').classList.toggle('active', scope === 'all');
  renderSourceStats();
}

function openSourceModal() {
  renderSourceStats();
  document.getElementById('source-modal').classList.add('open');
}

function closeSourceModal() {
  document.getElementById('source-modal').classList.remove('open');
}

function countBy(recs, keyFn) {
  const map = {};
  recs.forEach(r => {
    const k = keyFn(r);
    map[k] = (map[k] || 0) + 1;
  });
  return map;
}

const TC_DISTRICTS = ['西屯','南屯','北屯','豐原','東勢','大甲','清水','沙鹿','梧棲','后里','神岡','潭子','大雅','新社','石岡','外埔','大安','烏日','大肚','龍井','霧峰','太平','大里','和平','中區','東區','南區','西區','北區'];
const REGION_GROUPS = [
  { label: '雙北桃基', keys: ['台北','臺北','新北','桃園','基隆','中壢','板橋','三重','新莊'] },
  { label: '新竹',     keys: ['新竹','竹北','竹東','湖口','關西'] },
  { label: '苗栗',     keys: ['苗栗','頭份','竹南','後龍','通霄'] },
  { label: '彰化',     keys: ['彰化','員林','鹿港','和美','溪湖','田中','二林','北斗'] },
  { label: '南投',     keys: ['南投','草屯','埔里','竹山','名間','集集'] },
  { label: '南部',     keys: ['雲林','斗六','虎尾','西螺','嘉義','台南','臺南','高雄','屏東'] },
  { label: '東部',     keys: ['宜蘭','羅東','礁溪','花蓮','台東','臺東'] },
  { label: '離島',     keys: ['澎湖','金門','馬祖','連江','綠島','蘭嶼'] },
];

function normalizeRegionName(raw) {
  let s = String(raw || '').replace(/\s/g, '').trim();
  if (!s) return '未填';
  s = s.replace(/^(台灣|臺灣|台灣省|臺灣省)/, '');

  for (const g of REGION_GROUPS) {
    if (g.keys.some(k => s.includes(k))) return g.label;
  }

  const isTC = /台中|臺中/.test(s);
  const sorted = [...TC_DISTRICTS].sort((a, b) => b.length - a.length);
  for (const d of sorted) {
    if (s.includes(d)) {
      const name = d.endsWith('區') ? d : d + '區';
      return name;
    }
  }

  if (isTC) return '台中市';
  return s;
}

function buildSourceStatusTable(recs) {
  if (!recs.length) return '<span class="lw-empty">上週尚無名單</span>';

  const rows = {};
  const colSet = {};
  recs.forEach(r => {
    const m = normalizeMediaName(r.media);
    const st = r.status || '未填寫';
    if (!rows[m]) rows[m] = { total: 0, st: {} };
    rows[m].total++;
    rows[m].st[st] = (rows[m].st[st] || 0) + 1;
    colSet[st] = true;
  });

  const cols = STATUS_ORDER.filter(st => colSet[st])
    .concat(Object.keys(colSet).filter(st => !STATUS_ORDER.includes(st)));

  const sorted = Object.entries(rows).sort((a, b) => b[1].total - a[1].total);

  let html = '<table class="lw-table"><thead><tr>';
  html += '<th class="lw-src">來源</th>';
  cols.forEach(st => { html += `<th>${esc(st)}</th>`; });
  html += '<th>合計</th></tr></thead><tbody>';

  sorted.forEach(([m, o]) => {
    html += `<tr><td class="lw-src">${esc(m)}</td>`;
    cols.forEach(st => {
      const v = o.st[st] || 0;
      html += `<td class="${v ? '' : 'zero'}">${v || '—'}</td>`;
    });
    html += `<td class="lw-sum">${o.total}</td></tr>`;
  });

  const tot = { total: recs.length, st: {} };
  cols.forEach(st => {
    tot.st[st] = sorted.reduce((s, [, o]) => s + (o.st[st] || 0), 0);
  });
  html += '<tr class="lw-total"><td class="lw-src">合計</td>';
  cols.forEach(st => { html += `<td>${tot.st[st] || '—'}</td>`; });
  html += `<td>${tot.total}</td></tr>`;

  html += '</tbody></table>';
  return html;
}

function renderLastWeekModal() {
  const { mon, sun } = getWeekRange(-1);
  const recs = records.filter(r => inDispatchWeek(r, mon, sun));
  const fmt = d => (d.getMonth()+1) + '/' + d.getDate();
  document.getElementById('lw-range').innerHTML =
    `<span>派發期間 ${fmt(mon)}（一）～ ${fmt(sun)}（日）</span><span>共 <b>${recs.length}</b> 筆名單</span>`;

  const stCount = countBy(recs, r => r.status || '未填寫');
  const stEl = document.getElementById('lw-status');
  const stItems = STATUS_ORDER.filter(st => stCount[st]).map(st => {
    const cls = ['待確認','未接','已來訪','已預約','無需求','空號'].includes(st) ? 'badge-'+st : 'badge-default';
    return `<span class="badge ${cls}">${esc(st)} ${stCount[st]}</span>`;
  });

  Object.keys(stCount).filter(st => !STATUS_ORDER.includes(st)).forEach(st => {
    stItems.push(`<span class="badge badge-default">${esc(st)} ${stCount[st]}</span>`);
  });
  stEl.innerHTML = stItems.length ? stItems.join('') : '<span class="lw-empty">上週尚無名單</span>';

  document.getElementById('lw-media').innerHTML = buildSourceStatusTable(recs);

  const rgCount = countBy(recs, r => normalizeRegionName(r.region));
  const rgEl = document.getElementById('lw-region');
  const TC_LABELS = new Set(TC_DISTRICTS.map(d => d.endsWith('區') ? d : d + '區'));
  const rgRank = g => (g === '未填' ? 3 : g === '台中市' ? 0 : TC_LABELS.has(g) ? 1 : 2);
  const rgItems = Object.entries(rgCount)
    .sort((a,b) => (rgRank(a[0]) - rgRank(b[0])) || (b[1] - a[1]) || a[0].localeCompare(b[0],'zh-Hant'))
    .map(([g,c]) => `<span class="lw-chip">${esc(g)}<b>${c}</b></span>`);
  rgEl.innerHTML = rgItems.length ? rgItems.join('') : '<span class="lw-empty">上週尚無名單</span>';
}

function openLastWeekModal() {
  renderLastWeekModal();
  document.getElementById('lastweek-modal').classList.add('open');
}

function closeLastWeekModal() {
  document.getElementById('lastweek-modal').classList.remove('open');
}

function checkDuplicate() {
  const box = document.getElementById('fg-dup');
  if (!box) return;
  const phone = document.getElementById('f-phone').value;
  const dups = getDupRecords(phone, editingId);

  if (!dups.length) { box.style.display = 'none'; box.innerHTML = ''; return; }

  const active = dups.filter(o => { const dd = daysAgo(recDate(o)); return dd !== null && dd <= OWNERSHIP_DAYS; });
  const isActive = active.length > 0;
  box.className = 'dup-warn' + (isActive ? '' : ' expired');

  const items = dups.slice(0, 6).map(o => {
    const dd = daysAgo(recDate(o));
    const inPeriod = dd !== null && dd <= OWNERSHIP_DAYS;
    const dayTxt = dd === null ? '日期不明'
      : (inPeriod ? `${dd} 天前・歸屬期剩 ${OWNERSHIP_DAYS - dd} 天` : `${dd} 天前・已逾歸屬期`);
    const appt = o.apptDate ? `<span>預約 ${esc(o.apptDate)} ${esc(o.apptTime)}</span>` : '';
    return `<div class="dup-item">
      <span>${esc(o.year)}/${esc(o.date) || '—'}</span>
      <b>${esc(o.agent) || '未派發'}</b>
      ${badgeHtml(o.status)}
      ${appt}
      <span>${esc(o.media)}</span>
      <span class="dup-days ${inPeriod ? '' : 'expired'}">${dayTxt}</span>
    </div>`;
  }).join('');

  const more = dups.length > 6 ? `<div class="dup-item" style="justify-content:center;color:var(--text3)">…另有 ${dups.length - 6} 筆</div>` : '';

  const owner = (active.map(o => o.agent).find(Boolean)) || (dups.map(o => o.agent).find(Boolean)) || '';
  const actions = owner
    ? `<div class="dup-actions"><button type="button" class="dup-btn" onclick="applyOriginalAgent('${esc(owner)}')">沿用原業務：${esc(owner)}</button></div>`
    : '';

  box.innerHTML = `
    <div class="dup-warn-title">${isActive
      ? `⚠️ 歸屬期內重複留單（此電話共 ${dups.length + 1} 筆，請勿另派他人）`
      : `🔁 此電話過去曾留單 ${dups.length} 次（皆已逾 ${OWNERSHIP_DAYS} 天歸屬期）`}</div>
    <div class="dup-list">${items}${more}</div>
    ${actions}`;
  box.style.display = '';
}

function applyOriginalAgent(name) {
  document.getElementById('f-agent-input').value = name;
  const disp = document.getElementById('f-dispatch');
  if (!disp.value) {
    const today = new Date();
    disp.value = (today.getMonth()+1) + '/' + today.getDate();
  }
  showToast('已帶入原業務：' + name, 'success');
}

// ─── MODAL ───
function openModal(id) {
  editingId = id || null;
  const modal = document.getElementById('modal');
  const del = document.getElementById('btn-delete');
  if (id) {
    const r = records.find(x=>x.id===id);
    if (!r) return;
    document.getElementById('modal-title').textContent = '編輯聯絡人';
    document.getElementById('f-year').value = r.year || '';
    document.getElementById('f-date-input').value = r.date || '';
    document.getElementById('f-name').value = r.name || '';
    document.getElementById('f-phone').value = r.phone || '';
    document.getElementById('f-region').value = r.region || '';
    document.getElementById('f-contact-status').value = r.status || '';
    document.getElementById('f-appt-date').value = r.apptDate || '';
    document.getElementById('f-appt-time').value = r.apptTime || '';
    document.getElementById('fg-appt').classList.toggle('show', r.status === '已預約');
    document.getElementById('f-media-input').value = r.media || '';
    document.getElementById('f-agent-input').value = r.agent || '';
    document.getElementById('f-dispatch').value = r.dispatch || '';
    document.getElementById('f-notes').value = r.notes || '';

    const adGroup = document.getElementById('fg-ad-campaign');
    if (r.adCampaign) {
      document.getElementById('f-ad-campaign-display').textContent = r.adCampaign;
      adGroup.style.display = '';
    } else {
      adGroup.style.display = 'none';
    }

    del.style.display = '';
    checkDuplicate();
  } else {
    document.getElementById('modal-title').textContent = '新增聯絡人';
    document.getElementById('f-year').value = new Date().getFullYear();
    document.getElementById('f-date-input').value = '';
    document.getElementById('f-name').value = '';
    document.getElementById('f-phone').value = '';
    document.getElementById('f-region').value = '臺中市';
    document.getElementById('f-contact-status').value = '';
    document.getElementById('f-appt-date').value = '';
    document.getElementById('f-appt-time').value = '';
    document.getElementById('fg-appt').classList.remove('show');
    document.getElementById('f-media-input').value = '國建官網';
    document.getElementById('f-agent-input').value = '';
    const today = new Date();
    document.getElementById('f-dispatch').value = (today.getMonth()+1) + '/' + today.getDate();
    document.getElementById('f-notes').value = '';
    document.getElementById('fg-ad-campaign').style.display = 'none';
    del.style.display = 'none';
    document.getElementById('fg-dup').style.display = 'none';
  }
  modal.classList.add('open');
  document.getElementById('f-name').focus();
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  editingId = null;
}

async function saveRecord() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { showToast('請填入姓名', 'error'); return; }

  const apptDate = document.getElementById('f-appt-date').value.trim();
  const apptTime = document.getElementById('f-appt-time').value.trim();
  const tempId = editingId || ('temp_' + Date.now());

  const rec = {
    id: tempId,
    year: document.getElementById('f-year').value,
    date: document.getElementById('f-date-input').value,
    name,
    phone: document.getElementById('f-phone').value.trim(),
    region: document.getElementById('f-region').value.trim(),
    status: document.getElementById('f-contact-status').value,
    media: document.getElementById('f-media-input').value.trim(),
    agent: document.getElementById('f-agent-input').value.trim(),
    dispatch: document.getElementById('f-dispatch').value,
    notes: document.getElementById('f-notes').value.trim(),
    apptDate,
    apptTime,
    eventId: editingId ? ((records.find(r=>r.id===editingId)||{}).eventId || '') : '',
    adCampaign: editingId ? ((records.find(r=>r.id===editingId)||{}).adCampaign || '') : '',
  };

  const action = editingId ? 'update' : 'add';
  if (editingId) {
    const idx = records.findIndex(r=>r.id===editingId);
    if (idx >= 0) records[idx] = rec;
  } else {
    records.unshift(rec);
  }
  closeModal();
  renderTable();
  showToast('儲存中…');

  const result = await apiCall(action, rec);
  if (result && result.ok) {
    if (action === 'add' && result.newId) {
      const idx = records.findIndex(r => r.id === tempId);
      if (idx >= 0) records[idx].id = result.newId;
      rec.id = result.newId;
    }
    showToast(editingId ? '已更新並同步到 Google Sheets ✓' : '已新增並同步到 Google Sheets ✓', 'success');
    if (rec.status === '已預約' && rec.apptDate && rec.apptTime) {
      if (action === 'add') {
        await syncToCalendar(rec);
      } else {
        await updateCalendar(rec);
      }
    } else if (action === 'update' && rec.eventId) {
      await apiCall('deleteCalendar', { eventId: rec.eventId, id: rec.id });
    }
  } else {
    if (action === 'add') {
      records = records.filter(r => r.id !== tempId);
      renderTable();
    }
    showToast('儲存失敗，請重試', 'error');
  }
}

async function syncToCalendar(rec) {
  const result = await apiCall('addCalendar', rec);
  if (result && result.ok && result.msg === 'calendar_added') {
    showToast('已新增至 Google 行事曆 📅', 'success');
  }
}

async function updateCalendar(rec) {
  if (rec.eventId) {
    await apiCall('deleteCalendar', { eventId: rec.eventId, id: rec.id });
  }
  const result = await apiCall('addCalendar', rec);
  if (result && result.ok && result.msg === 'calendar_added') {
    showToast('日曆事件已更新 📅', 'success');
  }
}

async function deleteRecord() {
  if (!editingId) return;
  if (!confirm('確認刪除此筆資料？')) return;
  const rec = records.find(r=>r.id===editingId);
  records = records.filter(r=>r.id!==editingId);
  closeModal();
  renderTable();
  showToast('刪除中…');
  const result = await apiCall('delete', rec);
  if (result && result.ok) {
    showToast('已刪除並同步到 Google Sheets ✓', 'success');
  }
}

function exportCSV() {
  const filtered = getFiltered();
  const headers = ['日期','姓名','電話','區域','聯絡狀況','媒體','跑單','派發日','預約日期','預約時間','詳細狀況'];
  const rows = filtered.map(r => [
    r.date,r.name,r.phone,r.region,r.status,r.media,r.agent,r.dispatch,
    r.apptDate,r.apptTime,r.notes
  ].map(v => `"${(v||'').replace(/"/g,'""')}"`));
  const csv = '\uFEFF' + [headers, ...rows].map(r=>r.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '名單_' + new Date().toLocaleDateString('zh-TW').replace(/\//g,'-') + '.csv';
  a.click();
  showToast('CSV 已匯出', 'success');
}

function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2800);
}

window.addEventListener('DOMContentLoaded', async () => {
  setSyncStatus('loading');
  await loadData();

  const urlParams = new URLSearchParams(window.location.search);
  let agentParam = FORCE_AGENT || urlParams.get('agent') || null;
  if (agentParam === 'all' || agentParam === 'ALL') agentParam = null;
  const statusParam = urlParams.get('status');
  const mediaParam = urlParams.get('media');

  const _hoWait = HANDOVER_START - new Date();
  if (_hoWait > 0 && _hoWait < 86400000) setTimeout(updateHandoverBtn, _hoWait + 1000);

  renderTable();

  if (agentParam) {
    LOCKED_AGENT = String(agentParam).trim();
    document.getElementById('f-agent').value = agentParam;
    document.querySelector('.toolbar').style.display = 'none';
    document.getElementById('stats-bar').style.display = 'none';
    document.querySelectorAll('.btn-source').forEach(b => b.style.display = 'none');

    window.clearFilters = function() {
      handoverOnly = false;
      document.getElementById('search').value = '';
      document.getElementById('f-status').value = '';
      document.getElementById('f-media').value = '';
      document.getElementById('f-date').value = '';
      document.getElementById('f-year-filter').value = '';
      sortCol = 'date'; sortAsc = false; userSortActive = false;
      page = 1;
      renderTable();
    };

    const agentBar = document.createElement('div');
    agentBar.style.cssText = 'padding:10px 24px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--bg);border-bottom:1px solid var(--border);';

    const searchInput = document.createElement('input');
    searchInput.className = 'search-box';
    searchInput.type = 'text';
    searchInput.id = 'search-agent';
    searchInput.placeholder = '搜尋姓名、電話、備註…';
    searchInput.style.cssText = 'flex:1 1 200px;min-width:160px;max-width:340px;';
    searchInput.addEventListener('input', function() {
      document.getElementById('search').value = this.value;
      renderTable();
    });

    const statusSel = document.createElement('select');
    statusSel.className = 'filter';
    statusSel.id = 'f-status-agent';
    ['', '待確認', '未接', '已來訪', '已預約', '無需求', '空號'].forEach(function(v) {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v || '全部狀況';
      statusSel.appendChild(opt);
    });
    statusSel.addEventListener('change', function() {
      document.getElementById('f-status').value = this.value;
      renderTable();
    });

    const handoverBtn = document.createElement('button');
    handoverBtn.className = 'btn';
    handoverBtn.id = 'btn-handover-agent';
    handoverBtn.style.display = 'none';
    handoverBtn.textContent = '📋 交接名單';
    handoverBtn.addEventListener('click', toggleHandover);

    const nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'font-size:13px;color:var(--accent);font-weight:600;margin-left:auto;';
    nameSpan.textContent = '👤 ' + agentParam + ' 的名單';

    const weekStats = document.createElement('div');
    weekStats.id = 'agent-week-stats';
    weekStats.className = 'agent-week-stats';

    agentBar.appendChild(searchInput);
    agentBar.appendChild(statusSel);
    agentBar.appendChild(handoverBtn);
    agentBar.appendChild(weekStats);
    agentBar.appendChild(nameSpan);
    document.querySelector('.toolbar').insertAdjacentElement('afterend', agentBar);
  }
  if (statusParam) document.getElementById('f-status').value = statusParam;
  if (mediaParam) document.getElementById('f-media').value = mediaParam;

  renderTable();
  document.getElementById('loading-overlay').style.display = 'none';
  showToast('名單已載入，共 ' + records.length + ' 筆', 'success');

  setInterval(async () => {
    await loadData();
    renderTable();
    showToast('資料已自動更新 ↻', 'success');
  }, 3 * 60 * 1000);
});

function toggleApptField() {
  const status = document.getElementById('f-contact-status').value;
  const fg = document.getElementById('fg-appt');
  if (status === '已預約') {
    fg.classList.add('show');
    const dateInput = document.getElementById('f-appt-date');
    if (!dateInput.value) {
      const today = new Date();
      dateInput.value = (today.getMonth()+1) + '/' + today.getDate();
    }
    dateInput.focus();
    const len = dateInput.value.length;
    dateInput.setSelectionRange(len, len);
  } else {
    fg.classList.remove('show');
  }
}

function autoFillDispatch() {
  const agent = document.getElementById('f-agent-input').value.trim();
  const dispatch = document.getElementById('f-dispatch');
  if (agent && !dispatch.value) {
    const today = new Date();
    dispatch.value = (today.getMonth()+1) + '/' + today.getDate();
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeSourceModal(); closeLastWeekModal(); }
  if ((e.metaKey||e.ctrlKey) && e.key==='n') { e.preventDefault(); openModal(); }
});
