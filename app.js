// «Ритм семьи» v1 — интерфейс. Данные: Supabase (вход по email), режим ?demo=1 — в памяти для проверки.
(function () {
  const SB_URL = 'https://ywluhaqucaqhhodvjtlj.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bHVoYXF1Y2FxaGhvZHZqdGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNTc1NjksImV4cCI6MjEwNjkzMzU2OX0.O1LfghuzJTNUApRhJi8mDaVD5LPbt-_fEuTXpjPQDEg';
  const Q = new URLSearchParams(location.search);
  const DEMO = Q.has('demo');
  const R = window.RS;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COLORS = ['#6E97F2', '#EE7EA0', '#52BE8E', '#F0B84A', '#A79BF0', '#4FC3D9', '#F08A5D'];
  const EMOJI = ['🙂', '😎', '🦁', '🌸', '🐻', '🦊', '⭐', '🌊'];
  const TYPE_COLOR = { TWO: 'var(--two)', THREE: 'var(--three)', ME: 'var(--me)', Z: 'var(--sleep)' };
  const DOW = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const DOW_S = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const DOW_ACC = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];
  const IDEAS = ['Скутер вдоль побережья и завтрак у моря', 'Тайский массаж вдвоём', 'Остров Ко Лан: пляж и обед', 'Кулинарный мастер-класс тайской кухни', 'Урок танцев вдвоём', 'Дневной номер в отеле с бассейном', 'Бранч в месте, где никто не был', 'Каяки или SUP', 'Фотопрогулка: снимаем друг друга', 'Скалодром или верёвочный парк', 'Рынок и готовим вместе незнакомое блюдо', 'Спа-день: бассейн, сауна, массаж', 'Смотровая площадка на рассвете', 'Картинг — соревнуемся', 'Уличный рынок и 5 незнакомых блюд', '36 вопросов на близость за завтраком', 'Йога вдвоём на пляже', 'Сапы на закате', 'Гольф или мини-гольф', 'Стратегическая сессия о мечтах за кофе', 'Велопрогулка по новому району', 'Мастер-класс керамики', 'Дегустация кофе в трёх кофейнях', 'Аквапарк без ребёнка', 'Пикник с книгой и пледом', 'Экскурсия в храм и обед рядом', 'Тату-салон: смотрим эскизы (можно не делать)', 'Караоке на двоих', 'Ботанический сад Нонг Нуч', 'Прогулка по Джомтьену и коктейль на крыше', 'Рыбалка на пирсе', 'Шопинг-челлендж: подарок друг другу за 500 бат', 'Тир или лазертаг', 'Плавание с маской на острове', 'Готовим завтрак друг для друга и едим в саду', 'Записываем видео-письмо себе через год', 'Фермерский рынок и смузи', 'Мастер-класс фруктового карвинга', 'Колесо обозрения и мороженое', 'Пробуем новую кухню: индийская, корейская, мексиканская'];

  // ---------- хранилище ----------
  function demoDB() {
    const uid = Q.get('as') === 'B' ? 'uB' : 'uA';
    const key = 'rs_demo_db';
    let T; try { T = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    if (!T) T = { rf_families: [], rf_members: [], rf_exceptions: [], rf_busy: [], rf_requests: [], rf_dates: [], rf_ratings: [], rf_ideas: [], rf_notes: [] };
    const save = () => { try { localStorage.setItem(key, JSON.stringify(T)); } catch (e) {} };
    const id = () => Math.random().toString(36).slice(2, 10);
    const fam = () => (T.rf_members.find(x => x.user_id === uid) || {}).family_id;
    return {
      uid, demo: true,
      async session() { return { user: { id: uid, email: uid + '@demo' } }; },
      async select(t) {
        const f = fam();
        if (t === 'rf_families') return T.rf_families.filter(x => x.id === f);
        if (t === 'rf_notes') return T.rf_notes.filter(x => x.user_id === uid);
        if (t === 'rf_ratings') {
          const ds = T.rf_dates.filter(d => d.family_id === f).map(d => d.id);
          return T.rf_ratings.filter(r => ds.includes(r.date_id) && (r.user_id === uid || T.rf_ratings.filter(x => x.date_id === r.date_id).length >= 2));
        }
        return T[t].filter(x => x.family_id === f);
      },
      async me() { return T.rf_members.find(x => x.user_id === uid) || null; },
      async insert(t, row) { const r = Object.assign({ id: id(), created_at: new Date().toISOString() }, row); if (t !== 'rf_notes' && t !== 'rf_ratings') r.family_id = fam(); if (!r.user_id && (t === 'rf_busy' || t === 'rf_notes' || t === 'rf_ratings')) r.user_id = uid; if (t === 'rf_requests') { r.from_user = uid; r.status = r.status || 'pending'; } T[t].push(r); save(); return r; },
      async update(t, idv, patch) { const k = t === 'rf_members' ? 'user_id' : 'id'; const r = T[t].find(x => x[k] === idv); Object.assign(r, patch); save(); return r; },
      async remove(t, idv) { T[t] = T[t].filter(x => x.id !== idv); save(); },
      async upsertDate(row) { const f = fam(); let r = T.rf_dates.find(x => x.family_id === f && x.date === row.date); if (r) Object.assign(r, row); else { r = Object.assign({ id: id(), family_id: f, announced_by: uid, created_at: new Date().toISOString() }, row); T.rf_dates.push(r); } save(); return r; },
      async rpc(name, a) {
        if (name === 'rf_create_family') { const fid = id(); T.rf_families.push({ id: fid, name: a.p_name, invite_code: 'DEMO42', settings: a.p_settings }); T.rf_members.push({ user_id: uid, family_id: fid, role: 'A', name: a.p_member, color: a.p_color, emoji: a.p_emoji }); save(); return fid; }
        if (name === 'rf_join_family') { const f = T.rf_families.find(x => x.invite_code === a.p_code.toUpperCase()); if (!f) throw new Error('code not found'); const role = T.rf_members.some(x => x.family_id === f.id && x.role === 'A') ? 'B' : 'A'; T.rf_members.push({ user_id: uid, family_id: f.id, role, name: a.p_member, color: a.p_color, emoji: a.p_emoji }); save(); return f.id; }
      },
      async signIn() { return {}; }, async signUp() { return {}; }, async signOut() { localStorage.removeItem('rs_cache'); location.search = ''; }
    };
  }
  function supaDB() {
    const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    let uid = null;
    const chk = ({ data, error }) => { if (error) throw error; return data; };
    return {
      sb, get uid() { return uid; },
      async session() { const { data } = await sb.auth.getSession(); uid = data.session ? data.session.user.id : null; return data.session; },
      async me() { return chk(await sb.from('rf_members').select('*').eq('user_id', uid).maybeSingle()); },
      async select(t) { return chk(await sb.from(t).select('*')); },
      async insert(t, row) { if (!['rf_notes', 'rf_ratings'].includes(t)) row = Object.assign({ family_id: STATE.family.id }, row); return chk(await sb.from(t).insert(row).select().single()); },
      async update(t, idv, patch) { const k = t === 'rf_members' ? 'user_id' : 'id'; return chk(await sb.from(t).update(patch).eq(k, idv).select().single()); },
      async remove(t, idv) { chk(await sb.from(t).delete().eq('id', idv)); },
      async upsertDate(row) { return chk(await sb.from('rf_dates').upsert(Object.assign({ family_id: STATE.family.id }, row), { onConflict: 'family_id,date' }).select().single()); },
      async rpc(name, a) { return chk(await sb.rpc(name, a)); },
      async signIn(email, password) { const r = await sb.auth.signInWithPassword({ email, password }); if (r.error) throw r.error; return r.data; },
      async signUp(email, password) { const r = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } }); if (r.error) throw r.error; return r.data; },
      async signOut() { await sb.auth.signOut(); localStorage.removeItem('rs_cache'); location.reload(); }
    };
  }
  const DB = DEMO ? demoDB() : supaDB();

  // ---------- состояние ----------
  const STATE = { tab: localStorage.getItem('rs_tab') || 'today', weekOff: 0, sel: R.iso(new Date()), loaded: false };
  window.STATE = STATE;
  const S = () => R.settings(STATE.family && STATE.family.settings);
  const meRole = () => STATE.me && STATE.me.role;
  const member = r => (STATE.members || []).find(x => x.role === r);
  const NAMES = () => { const s = S(), n = s.names || {}; return { A: (member('A') || {}).name || n.A || 'Партнёр А', B: (member('B') || {}).name || n.B || 'Партнёр Б' }; };
  const colorOf = r => (member(r) || {}).color || (r === 'A' ? '#6E97F2' : '#EE7EA0');
  const typeColor = t => (t === 'A' || t === 'B') ? colorOf(t) : TYPE_COLOR[t] || 'var(--muted)';
  const roleOfUser = u => ((STATE.members || []).find(x => x.user_id === u) || {}).role;
  const fmt = (d, o) => d.toLocaleDateString('ru-RU', o || { day: 'numeric', month: 'long' });

  async function loadAll() {
    const me = await DB.me();
    STATE.me = me;
    if (!me) { STATE.loaded = true; return; }
    const tabs = ['rf_families', 'rf_members', 'rf_exceptions', 'rf_busy', 'rf_requests', 'rf_dates', 'rf_ratings', 'rf_ideas', 'rf_notes'];
    const res = await Promise.all(tabs.map(t => DB.select(t)));
    [STATE.family] = res[0]; STATE.members = res[1]; STATE.ex = res[2]; STATE.busy = res[3]; STATE.req = res[4];
    STATE.dates = res[5]; STATE.ratings = res[6]; STATE.ideas = res[7]; STATE.notes = res[8];
    STATE.loaded = true;
    try { localStorage.setItem('rs_cache', JSON.stringify({ me: STATE.me, family: STATE.family, members: STATE.members, ex: STATE.ex, busy: STATE.busy, req: STATE.req, dates: STATE.dates, ratings: STATE.ratings, ideas: STATE.ideas })); } catch (e) {}
  }
  function fromCache() { try { const c = JSON.parse(localStorage.getItem('rs_cache')); if (c && c.me) { Object.assign(STATE, c, { notes: [], loaded: true, cached: true }); return true; } } catch (e) {} return false; }
  async function refresh() { try { await loadAll(); STATE.cached = false; render(); } catch (e) { toast('Нет связи. Показываю последние сохранённые данные.'); } }

  // ---------- помощники UI ----------
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2600); }
  function sheet(html, onSubmit, onClick) {
    const w = $('#sheet'); w.innerHTML = `<div class="sheetbox" role="dialog" aria-modal="true"><button class="x" data-close aria-label="Закрыть">×</button>${html}</div>`;
    w.classList.add('on');
    const form = w.querySelector('form');
    if (form && onSubmit) form.onsubmit = async ev => { ev.preventDefault(); const btn = form.querySelector('[type=submit]'); if (btn) btn.disabled = true; try { await onSubmit(new FormData(form), form); } catch (e) { toast(errText(e)); if (btn) btn.disabled = false; } };
    w.onclick = async ev => { if (ev.target === w || ev.target.closest('[data-close]')) closeSheet(); else if (onClick) { const b = ev.target.closest('[data-a]'); if (b) try { await onClick(b.dataset.a, b); } catch (e) { toast(errText(e)); } } };
  }
  function closeSheet() { $('#sheet').classList.remove('on'); $('#sheet').innerHTML = ''; }
  function errText(e) {
    const m = (e && (e.message || e.error_description)) || String(e);
    if (/Invalid login/i.test(m)) return 'Неверный email или пароль.';
    if (/Email not confirmed/i.test(m)) return 'Подтверди email: открой письмо от Supabase и нажми ссылку.';
    if (/already registered/i.test(m)) return 'Этот email уже зарегистрирован. Нажми «Войти».';
    if (/code not found/.test(m)) return 'Код не найден. Проверь буквы.';
    if (/family is full/.test(m)) return 'В этой семье уже двое.';
    if (/Password should be/i.test(m)) return 'Пароль — минимум 6 символов.';
    return 'Не получилось: ' + m;
  }
  const timeOpts = (v) => { let o = ''; for (let n = 0; n < 1440; n += 5) { const t = R.hm(n); o += `<option ${t === v ? 'selected' : ''}>${t}</option>`; } return o; };
  const roleSel = (name, v) => `<select name="${name}">${['A', 'B'].map(r => `<option value="${r}" ${v === r ? 'selected' : ''}>${esc(NAMES()[r])}</option>`).join('')}</select>`;

  // ---------- рендер ----------
  function render() {
    const app = $('#app');
    if (!STATE.session && !DEMO) { app.innerHTML = authView(); bindAuth(); $('#nav').hidden = true; return; }
    if (!STATE.loaded) { app.innerHTML = '<p class="muted pad">Загружаю…</p>'; return; }
    if (!STATE.me) { app.innerHTML = familyView(); bindFamily(); $('#nav').hidden = true; return; }
    if (!S().ready && !STATE.wizard) { STATE.wizard = { step: 0, draft: wizardDraft() }; }
    if (STATE.wizard) { app.innerHTML = wizardView(); bindWizard(); $('#nav').hidden = true; return; }
    $('#nav').hidden = false;
    document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === STATE.tab ? 'page' : 'false'));
    app.innerHTML = (STATE.cached ? '<p class="offline">Нет связи — показываю сохранённое</p>' : '') + ({ today: todayView, week: weekView, dates: datesView, me: cabinetView }[STATE.tab])();
    bindMain();
  }

  // ----- вход -----
  function authView() {
    return `<section class="auth"><h1>Ритм семьи</h1><p class="muted">График на двоих: кто с ребёнком, у кого своё время и когда свидание.</p>
    <form id="authForm" class="card form"><label>Email<input name="email" type="email" required autocomplete="email"></label>
    <label>Пароль<input name="password" type="password" minlength="6" required autocomplete="current-password"></label>
    <button class="btn" type="submit" data-mode="in">Войти</button><button class="btn ghost" type="button" id="signUp">Создать аккаунт</button>
    <p class="status" id="authStatus" role="status"></p></form></section>`;
  }
  function bindAuth() {
    const f = $('#authForm'), st = $('#authStatus');
    f.onsubmit = async ev => { ev.preventDefault(); st.textContent = 'Вхожу…'; try { await DB.signIn(f.email.value.trim(), f.password.value); await boot(); } catch (e) { st.textContent = errText(e); } };
    $('#signUp').onclick = async () => {
      if (!f.reportValidity()) return; st.textContent = 'Создаю аккаунт…';
      try { const r = await DB.signUp(f.email.value.trim(), f.password.value); if (r.session) await boot(); else st.textContent = 'Готово. Открой письмо на ' + f.email.value.trim() + ', подтверди адрес и вернись сюда, чтобы войти.'; }
      catch (e) { st.textContent = errText(e); }
    };
  }

  // ----- семья -----
  function familyView() {
    const code = Q.get('join') || '';
    const picker = (name, list, v) => `<div class="pick">${list.map(x => `<label><input type="radio" name="${name}" value="${x}" ${x === v ? 'checked' : ''}><span style="${name === 'color' ? 'background:' + x : ''}">${name === 'color' ? '' : x}</span></label>`).join('')}</div>`;
    const who = `<label>Как тебя зовут<input name="member" required placeholder="Айрат"></label><p class="lbl">Цвет</p>${picker('color', COLORS, code ? COLORS[1] : COLORS[0])}<p class="lbl">Значок</p>${picker('emoji', EMOJI, EMOJI[0])}`;
    return `<section class="pad"><h1>Ваша семья</h1>
    <form id="joinForm" class="card form" ${code ? '' : 'hidden'}><h2>Присоединиться по коду</h2><label>Код от партнёра<input name="code" value="${esc(code)}" required autocapitalize="characters"></label>${who}<button class="btn" type="submit">Присоединиться</button></form>
    <form id="createForm" class="card form" ${code ? 'hidden' : ''}><h2>Создать семью</h2><label>Название<input name="fname" value="Наша семья"></label>${who}<button class="btn" type="submit">Создать и настроить график</button></form>
    <button class="btn ghost wide" id="swapForm">${code ? 'Нет кода — создать новую семью' : 'У меня есть код от партнёра'}</button></section>`;
  }
  function bindFamily() {
    $('#swapForm').onclick = () => { $('#joinForm').hidden = !$('#joinForm').hidden; $('#createForm').hidden = !$('#createForm').hidden; };
    $('#createForm').onsubmit = async ev => { ev.preventDefault(); const f = ev.target; try { await DB.rpc('rf_create_family', { p_name: f.fname.value, p_member: f.member.value.trim(), p_color: f.color.value, p_emoji: f.emoji.value, p_settings: { names: { A: f.member.value.trim() } } }); await loadAll(); render(); } catch (e) { toast(errText(e)); } };
    $('#joinForm').onsubmit = async ev => { ev.preventDefault(); const f = ev.target; try { await DB.rpc('rf_join_family', { p_code: f.code.value.trim(), p_member: f.member.value.trim(), p_color: f.color.value, p_emoji: f.emoji.value }); history.replaceState(null, '', location.pathname + (DEMO ? location.search.replace(/[?&]join=[^&]*/, '') : '')); await loadAll(); render(); } catch (e) { toast(errText(e)); } };
  }

  // ----- мастер графика -----
  function wizardDraft() { const s = S(); s.names = NAMES(); if (!s.sad.start || !s.ready) { const t = R.iso(new Date()); s.sad.start = s.ready ? s.sad.start : t; s.bath.start = s.ready ? s.bath.start : t; s.date.plannerWeek = s.ready ? s.date.plannerWeek : R.iso(R.mondayOf(new Date())); s.weekend.satWeek = s.ready ? s.weekend.satWeek : R.iso(R.mondayOf(new Date())); } return s; }
  const STEPS = ['Кто в семье', 'Подъём и отбой', 'Сад или школа', 'Очереди', 'Свидания', 'Вечер и выходные'];
  function wizardView() {
    const W = STATE.wizard, d = W.draft, n = d.names, i = W.step;
    const sel2 = (name, v) => `<select name="${name}"><option value="A" ${v === 'A' ? 'selected' : ''}>${esc(n.A)}</option><option value="B" ${v === 'B' ? 'selected' : ''}>${esc(n.B)}</option></select>`;
    const T = (name, v) => `<select name="${name}">${timeOpts(v)}</select>`;
    let body = '';
    if (i === 0) body = `<label>Партнёр А${member('A') ? ' (в приложении)' : ''}<input name="nA" value="${esc(n.A)}" ${member('A') ? 'readonly' : ''}></label>
      <label>Партнёр Б${member('B') ? ' (в приложении)' : ''}<input name="nB" value="${esc(n.B === 'Партнёр Б' ? '' : n.B)}" placeholder="Имя партнёра" ${member('B') ? 'readonly' : ''}></label>
      <label>Имя ребёнка<input name="child" value="${esc(d.child)}" placeholder="Усман"></label><label>Возраст (необязательно)<input name="age" inputmode="numeric" value="${esc(d.age || '')}"></label>`;
    if (i === 1) body = `<div class="row2"><label>Подъём${T('wake', d.wake)}</label><label>Отбой взрослых${T('bed', d.bed)}</label></div>`;
    if (i === 2) body = `<label class="chk"><input type="checkbox" name="son" ${d.school.on ? 'checked' : ''}> Ребёнок ходит в сад или школу</label>
      <p class="lbl">Дни</p><div class="pick days">${[1, 2, 3, 4, 5, 6, 0].map(k => `<label><input type="checkbox" name="sd" value="${k}" ${d.school.days.includes(k) ? 'checked' : ''}><span>${DOW_S[k]}</span></label>`).join('')}</div>
      <div class="row2"><label>Начало${T('sst', d.school.start)}</label><label>Конец${T('sen', d.school.end)}</label></div><label>Дорога в одну сторону, минут<input name="tr" type="number" min="0" max="120" value="${d.school.travel}"></label>
      <p class="muted">Выезд в ${R.hm(R.m(d.school.start) - d.school.travel)}, забирать в ${R.hm(R.m(d.school.end) - d.school.travel)}.</p>`;
    if (i === 3) body = `<h3>Кто отвозит и забирает</h3><p class="muted">Через день, по дням сада.</p><div class="row2"><label>В первый день${sel2('sadF', d.sad.first)}</label><label>С даты<input type="date" name="sadS" value="${d.sad.start}"></label></div>
      <h3>Кто купает, укладывает и спит с ребёнком</h3><p class="muted">Через день, и в выходные тоже.</p><div class="row2"><label>В первый день${sel2('bathF', d.bath.first)}</label><label>С даты<input type="date" name="bathS" value="${d.bath.start}"></label></div>`;
    if (i === 4) body = `<label class="chk"><input type="checkbox" name="don" ${d.date.on ? 'checked' : ''}> Свидание каждую неделю</label>
      <label>День<select name="ddow">${[1, 2, 3, 4, 5, 6, 0].map(k => `<option value="${k}" ${d.date.dow === k ? 'selected' : ''}>${DOW[k]}</option>`).join('')}</select></label>
      <div class="row2"><label>С${T('dst', d.date.start)}</label><label>До${T('den', d.date.end)}</label></div>
      <div class="row2"><label>Придумывает на этой неделе${sel2('dpl', d.date.plannerFirst)}</label><label>Озвучить до<select name="ddl">${[0, 1, 2, 3, 4, 5, 6].map(k => `<option value="${k}" ${d.date.deadlineDow === k ? 'selected' : ''}>${DOW_ACC[k]}</option>`).join('')}</select></label></div><label>Время дедлайна${T('ddt', d.date.deadline)}</label>`;
    if (i === 5) body = `<div class="row2"><label>Ужин с${T('din', d.eve.dinner)}</label><label>до${T('dinE', d.eve.dinnerEnd)}</label></div>
      <div class="row2"><label>После сада с ребёнком${sel2('kw', d.eve.kidWith)}</label><label>Готовит${sel2('ck', d.eve.cook)}</label></div>
      <div class="row2"><label>Вдвоём с${T('tg', d.eve.together)}</label><label>до${T('tgE', d.eve.togetherEnd)}</label></div>
      <div class="row2"><label>Утро субботы на этой неделе${sel2('sat', d.weekend.satFirst)}</label><label>Семейный совет (вс)${T('cnc', d.weekend.council)}</label></div>
      <h3>Как выглядит будний день</h3><ol class="timeline mini">${R.blocksFor(d, R.day(nextWeekday()), n, []).map((b, k) => blockLi(b, k, false)).join('')}</ol>`;
    return `<section class="pad wizard"><p class="muted">Шаг ${i + 1} из 6</p><div class="prog"><i style="width:${(i + 1) / 6 * 100}%"></i></div><h1>${STEPS[i]}</h1>
      <form id="wz" class="form">${body}<div class="row2 navrow"><button type="button" class="btn ghost" id="wzBack">${i ? 'Назад' : (S().ready ? 'Отмена' : 'Назад')}</button><button class="btn" type="submit">${i === 5 ? 'Сохранить график' : 'Далее'}</button></div></form></section>`;
  }
  function nextWeekday() { const d = new Date(); while (!R.isSchoolDay(STATE.wizard.draft, d) || R.isDateDay(STATE.wizard.draft, d)) { d.setDate(d.getDate() + 1); if (d - new Date() > 14 * 864e5) break; } return R.iso(d); }
  function readWizard(f) {
    const d = STATE.wizard.draft, i = STATE.wizard.step, v = k => f.elements[k] && f.elements[k].value;
    if (i === 0) { d.names = { A: v('nA') || 'Партнёр А', B: v('nB') || 'Партнёр Б' }; d.child = v('child').trim(); d.childWith = R.instr(d.child); d.age = v('age'); }
    if (i === 1) { d.wake = v('wake'); d.bed = v('bed'); }
    if (i === 2) { d.school.on = f.son.checked; d.school.days = [...f.querySelectorAll('[name=sd]:checked')].map(x => +x.value); d.school.start = v('sst'); d.school.end = v('sen'); d.school.travel = +v('tr') || 0; }
    if (i === 3) { d.sad.first = v('sadF'); d.sad.start = v('sadS'); d.bath.first = v('bathF'); d.bath.start = v('bathS'); }
    if (i === 4) { d.date.on = f.don.checked; d.date.dow = +v('ddow'); d.date.start = v('dst'); d.date.end = v('den'); d.date.plannerFirst = v('dpl'); d.date.plannerWeek = R.iso(R.mondayOf(new Date())); d.date.deadlineDow = +v('ddl'); d.date.deadline = v('ddt'); }
    if (i === 5) { d.eve.dinner = v('din'); d.eve.dinnerEnd = v('dinE'); d.eve.kidWith = v('kw'); d.eve.cook = v('ck'); d.eve.together = v('tg'); d.eve.togetherEnd = v('tgE'); d.weekend.satFirst = v('sat'); d.weekend.satWeek = R.iso(R.mondayOf(new Date())); d.weekend.council = v('cnc'); }
  }
  function bindWizard() {
    const f = $('#wz');
    f.onchange = () => { readWizard(f); if (STATE.wizard.step === 2 || STATE.wizard.step === 5) { const st = STATE.wizard.step; render(); STATE.wizard.step = st; } };
    $('#wzBack').onclick = () => { readWizard(f); if (STATE.wizard.step) { STATE.wizard.step--; render(); } else if (S().ready) { STATE.wizard = null; render(); } };
    f.onsubmit = async ev => {
      ev.preventDefault(); readWizard(f);
      if (STATE.wizard.step < 5) { STATE.wizard.step++; render(); window.scrollTo(0, 0); return; }
      const d = STATE.wizard.draft; d.ready = true;
      try { STATE.family = await DB.update('rf_families', STATE.family.id, { settings: d }); STATE.wizard = null; STATE.tab = 'today'; await refresh(); toast('График сохранён'); } catch (e) { toast(errText(e)); }
    };
  }

  // ----- блоки и таймлайн -----
  function blockLi(b, i, live) {
    return `<li class="${live ? 'live' : ''}" style="--c:${typeColor(b.type)}" ${b.key ? `data-block="${esc(b.key)}"` : ''}><div class="t">${b.start}<small>${b.end}</small></div><div class="blk"><b>${esc(b.title)}</b>${b.sub ? `<span>${esc(b.sub)}</span>` : ''}</div></li>`;
  }
  function busyFor(dateIso) { return (STATE.busy || []).filter(x => x.date === dateIso).sort((a, b) => R.m(a.start_t) - R.m(b.start_t)); }
  function conflicts(bz, blocks) { const r = roleOfUser(bz.user_id); return blocks.filter(b => b.type === r && R.m(b.start) < R.m(bz.end_t) && R.m(bz.start_t) < R.m(b.end) && R.m(b.end) > R.m(b.start)); }
  function timeline(dateIso, liveIdx) {
    const d = R.day(dateIso), blocks = R.blocksFor(S(), d, NAMES(), STATE.ex);
    const items = blocks.map((b, i) => ({ s: R.m(b.start) + (b.key === 'sleep' ? 1440 : 0), html: blockLi(b, i, i === liveIdx) }));
    busyFor(dateIso).forEach(bz => {
      const r = roleOfUser(bz.user_id), c = conflicts(bz, blocks), nm = NAMES()[r] || '';
      items.push({ s: R.m(bz.start_t) + 0.5, html: `<li class="busy" style="--c:${colorOf(r)}" data-busy="${bz.id}"><div class="t">${bz.start_t}<small>${bz.end_t}</small></div><div class="blk"><b>📌 ${esc(bz.title)}</b><span>Занят(а): ${esc(nm)}${c.length ? ` · <em class="conf">конфликт с «${esc(c[0].title)}»</em>` : ''}</span></div></li>` });
    });
    const exs = (STATE.ex || []).filter(e => e.date === dateIso && e.kind !== 'block_edit');
    const EXN = { swap_sad: 'Обмен: сад', swap_bath: 'Обмен: укладывание', sad_closed: 'Сад закрыт' };
    const chips = exs.length ? `<div class="chips">${exs.map(e => `<button class="chip" data-delex="${e.id}">${EXN[e.kind] || e.kind} ×</button>`).join('')}</div>` : '';
    return chips + `<ol class="timeline" data-day="${dateIso}">${items.sort((a, b) => a.s - b.s).map(x => x.html).join('')}</ol>`;
  }

  // ----- Сегодня -----
  function todayView() {
    const now = new Date(), t = R.iso(now);
    let d = R.day(t), blocks = R.blocksFor(S(), d, NAMES(), STATE.ex), li = R.liveIndex(blocks, now);
    let card = '<div class="now" style="background:var(--sleep)"><div class="what">Свободное окно</div></div>';
    if (li >= 0) {
      const b = blocks[li], s = R.m(b.start), e = R.m(b.end), n = now.getHours() * 60 + now.getMinutes();
      const len = e > s ? e - s : e + 1440 - s, done = (n - s + 1440) % 1440;
      let nx = blocks[li + 1]; if (!nx) { const tm = new Date(d); tm.setDate(tm.getDate() + 1); nx = R.blocksFor(S(), tm, NAMES(), STATE.ex)[0]; }
      card = `<div class="now" style="background:${typeColor(b.type)}"><div class="when">Сейчас, ${b.start}–${b.end}</div><div class="what">${esc(b.title)}</div>${b.sub ? `<div class="who">${esc(b.sub)}</div>` : ''}<div class="bar"><i style="width:${Math.min(100, Math.round(done / len * 100))}%"></i></div>${nx ? `<div class="next">Дальше в ${nx.start}: ${esc(nx.title)}</div>` : ''}</div>`;
    }
    const pend = (STATE.req || []).filter(r => r.status === 'pending' && r.from_user !== DB.uid);
    const mine = (STATE.req || []).filter(r => r.status === 'pending' && r.from_user === DB.uid);
    const RQ = { swap_sad: 'сад', swap_bath: 'укладывание' };
    const reqHtml = pend.map(r => `<div class="card req"><b>${esc(NAMES()[roleOfUser(r.from_user)] || 'Партнёр')} просит обмен: ${RQ[r.kind] || r.kind}, ${fmt(R.day(r.date), { weekday: 'short', day: 'numeric', month: 'short' })}</b>${r.note ? `<p class="muted">${esc(r.note)}</p>` : ''}<div class="row2"><button class="btn" data-acc="${r.id}">Принять</button><button class="btn ghost" data-dec="${r.id}">Не могу</button></div></div>`).join('')
      + mine.map(r => `<p class="muted small">Ждём ответ на обмен (${RQ[r.kind]}, ${fmt(R.day(r.date), { day: 'numeric', month: 'short' })}) · <button class="link" data-delreq="${r.id}">отменить</button></p>`).join('');
    const exp = ['A', 'B'].map(r => { const mm = member(r); return mm && mm.expect ? `<p><b style="color:${colorOf(r)}">${esc(mm.name)} ждёт:</b> ${esc(mm.expect)}</p>` : ''; }).join('');
    return `${reqHtml}${card}
      <div class="quick"><button data-q="swap">⇄ Поменяться</button><button data-q="closed">🏠 Сад закрыт</button><button data-q="busy">📌 Занятость</button><button data-q="text">✍️ Опиши изменения</button></div>
      <h2 class="dayh">${fmt(now, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>${timeline(t, li)}
      <div class="card"><label class="lbl" for="exp">Завтра я жду…</label><div class="inrow"><input id="exp" placeholder="Одна вещь, которой хочется" value="${esc(STATE.me.expect || '')}"><button class="btn" data-q="exp">Записать</button></div>${exp}</div>`;
  }

  // ----- Неделя -----
  function weekView() {
    const mon = R.mondayOf(new Date()); mon.setDate(mon.getDate() + 7 * STATE.weekOff);
    const days = Array.from({ length: 7 }, (_, k) => { const x = new Date(mon); x.setDate(mon.getDate() + k); return x; });
    if (!days.some(x => R.iso(x) === STATE.sel)) STATE.sel = R.iso(days[(new Date().getDay() + 6) % 7]);
    const s = S(), cnt = { A: 0, B: 0 }, bc = { A: 0, B: 0 }, today = R.iso(new Date());
    const pills = days.map(x => {
      const iso = R.iso(x), sch = R.isSchoolDay(s, x), who = sch ? R.sadFor(s, x, STATE.ex) : (x.getDay() === 6 ? R.satFor(s, x) : null);
      if (sch) cnt[who]++; bc[R.bathFor(s, x, STATE.ex)]++;
      return `<button data-sel="${iso}" aria-pressed="${iso === STATE.sel}" class="${iso === today ? 'today' : ''}"><span>${DOW_S[x.getDay()]}</span><span class="d">${x.getDate()}</span><i class="bdot" style="background:${who ? colorOf(who) : 'var(--three)'}"></i>${R.isDateDay(s, x) ? '<i class="heart">♥</i>' : ''}</button>`;
    }).join('');
    const N = NAMES(), sd = R.day(STATE.sel);
    const note = (R.isSchoolDay(s, sd) ? 'Сад: ' + N[R.sadFor(s, sd, STATE.ex)] + '. ' : '') + 'Укладывает: ' + N[R.bathFor(s, sd, STATE.ex)] + '.' + (R.isDateDay(s, sd) ? ' Свидание.' : '');
    return `<div class="wk"><button class="btn ghost" data-wk="-1" aria-label="Прошлая неделя">‹</button><div><b>${fmt(days[0], { day: 'numeric', month: 'short' })} – ${fmt(days[6], { day: 'numeric', month: 'short' })}${STATE.weekOff === 0 ? ' · эта неделя' : ''}</b>
      <small>Сад: ${esc(N.A)} ${cnt.A}, ${esc(N.B)} ${cnt.B} · Укладывание: ${esc(N.A)} ${bc.A}, ${esc(N.B)} ${bc.B}</small></div><button class="btn ghost" data-wk="1" aria-label="Следующая неделя">›</button></div>
      <div class="days">${pills}</div><p class="muted dayn">${fmt(sd, { weekday: 'long', day: 'numeric', month: 'long' })}. ${esc(note)}</p>
      <div class="quick"><button data-q="swap" data-d="${STATE.sel}">⇄ Поменяться</button><button data-q="closed" data-d="${STATE.sel}">🏠 Сад закрыт</button><button data-q="busy" data-d="${STATE.sel}">📌 Занятость</button><button data-q="text">✍️ Опиши</button></div>
      ${timeline(STATE.sel, STATE.sel === today ? R.liveIndex(R.blocksFor(s, sd, N, STATE.ex), new Date()) : -1)}`;
  }

  // ----- Свидания -----
  function datesView() {
    const s = S(), N = NAMES(), now = new Date();
    if (!s.date.on) return '<div class="card"><h2>Свидания выключены</h2><p class="muted">Включи их в Кабинет → Настройки графика.</p></div>';
    const nd = R.nextDate(s, now), iso = R.iso(nd), pl = R.plannerFor(s, nd), plan = (STATE.dates || []).find(x => x.date === iso), dl = R.deadlineFor(s, nd);
    let st = '';
    if (plan) st = `<div class="announced"><b>Озвучено:</b> ${esc(plan.idea)}<small>${esc(N[roleOfUser(plan.announced_by)] || '')}</small></div>`;
    else if (now > dl) st = `<div class="late">${fmt(dl, { weekday: 'long' })[0].toUpperCase() + fmt(dl, { weekday: 'long' }).slice(1)} прошёл, а свидание не озвучено. ${esc(N[pl])}, сегодня.</div>`;
    const form = (meRole() === pl || plan) ? `<form id="planForm" class="form"><label>${plan ? 'Изменить идею' : 'Идея свидания'}<input name="idea" required placeholder="Что, где, во сколько" value="${plan ? esc(plan.idea) : ''}"></label><div class="inrow"><button class="btn" type="submit">${plan ? 'Сохранить' : 'Озвучить'}</button><button class="btn ghost" type="button" data-q="pick">Вытянуть идею</button></div></form>` : `<p class="muted">На этой неделе придумывает ${esc(N[pl])}. Идея появится здесь.</p>`;
    const chips = [1, 2, 3, 4].map(k => { const x = new Date(nd); x.setDate(x.getDate() + 7 * k); const r = R.plannerFor(s, x); return `<span style="border-color:${colorOf(r)}">${fmt(x, { day: 'numeric', month: 'short' })}: ${esc(N[r])}</span>`; }).join('');
    // оценки
    const past = (STATE.dates || []).filter(x => x.date < R.iso(now) || (x.date === R.iso(now) && now.getHours() * 60 + now.getMinutes() >= R.m(s.date.end))).sort((a, b) => b.date.localeCompare(a.date));
    const rOf = id => (STATE.ratings || []).filter(r => r.date_id === id);
    const toRate = past.filter(x => !rOf(x.id).some(r => r.user_id === DB.uid));
    const rateHtml = toRate.slice(0, 3).map(x => `<form class="card form rateF" data-date="${x.id}"><h2>Как прошло: ${esc(x.idea)}</h2><p class="muted">${fmt(R.day(x.date))}. Оценка вслепую: партнёр увидит её, когда оценит сам.</p>
      <div class="scores">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => `<label><input type="radio" name="score" value="${k}" required><span>${k}</span></label>`).join('')}</div>
      <label>Что зашло больше всего<textarea name="liked" placeholder="Одна-две фразы"></textarea></label><label>Повторить?<select name="repeat"><option value="да">Да</option><option value="в другом виде">В другом виде</option><option value="нет">Нет</option></select></label><button class="btn" type="submit">Сохранить оценку</button></form>`).join('');
    const hist = past.map(x => {
      const rs = rOf(x.id), both = rs.length >= 2, mineR = rs.find(r => r.user_id === DB.uid);
      const sc = both ? (rs.reduce((a, r) => a + r.score, 0) / rs.length).toFixed(1) : '';
      const detail = both ? rs.map(r => `${esc(N[roleOfUser(r.user_id)])} ${r.score}${r.liked ? ' — «' + esc(r.liked) + '»' : ''}`).join(' · ') : mineR ? `Твоя оценка ${mineR.score}. Ждём оценку партнёра` : 'Ещё не оценено';
      return `<div class="entry"><div class="h"><b>${esc(x.idea)}</b><span class="score">${sc}</span></div><p class="muted">${fmt(R.day(x.date))}${x.planner ? ' · придумал(а) ' + esc(N[x.planner]) : ''}</p><p class="small">${detail}</p></div>`;
    }).join('');
    const rated = past.filter(x => rOf(x.id).length >= 2), avg = rated.length ? (rated.reduce((a, x) => a + rOf(x.id).reduce((b, r) => b + r.score, 0) / 2, 0) / rated.length).toFixed(1) : '—';
    const best = rated.slice().sort((a, b) => rOf(b.id).reduce((c, r) => c + r.score, 0) - rOf(a.id).reduce((c, r) => c + r.score, 0))[0];
    let streak = 0; { const wk = new Set((STATE.dates || []).map(x => R.iso(R.mondayOf(R.day(x.date))))); const m0 = R.mondayOf(nd); if (!wk.has(R.iso(m0))) m0.setDate(m0.getDate() - 7); while (wk.has(R.iso(m0))) { streak++; m0.setDate(m0.getDate() - 7); } }
    return `<div class="card"><h2>Свидание: ${fmt(nd, { weekday: 'long', day: 'numeric', month: 'long' })}, ${s.date.start}–${s.date.end}</h2>
      <p>Придумывает: <span class="whoBig" style="color:${colorOf(pl)}">${esc(N[pl])}</span></p><p class="muted">Озвучить до ${fmt(dl, { weekday: 'short', day: 'numeric', month: 'long' })}, ${s.date.deadline}.</p>${st}${form}
      <div class="chips">${chips}</div><p class="muted small">Только активное и новое, телефоны в сумке.</p></div>
      ${rateHtml}
      <div class="card"><h2>Наша история</h2><div class="stats"><div><b>${past.length}</b><span>свиданий</span></div><div><b>${avg}</b><span>средняя оценка</span></div><div><b>${streak}</b><span>недель подряд</span></div></div>${best ? `<p class="small">Лучшее: <b>${esc(best.idea)}</b></p>` : ''}
      <div class="log">${hist || '<p class="muted">Первое свидание ещё впереди.</p>'}</div><button class="btn ghost wide" data-q="pastdate">+ Добавить прошедшее свидание</button></div>
      <div class="card"><h2>Банк идей</h2><p class="muted small">${IDEAS.length + (STATE.ideas || []).length} идей. Свои идеи тоже попадают в «Вытянуть идею».</p><div class="inrow"><input id="newIdea" placeholder="Своя идея"><button class="btn" data-q="addidea">Добавить</button></div>${(STATE.ideas || []).map(x => `<p class="small">• ${esc(x.text)} <button class="link" data-delidea="${x.id}">×</button></p>`).join('')}</div>`;
  }

  // ----- Кабинет -----
  function cabinetView() {
    const me = STATE.me, s = S(), N = NAMES(), mon = R.mondayOf(new Date());
    let personal = 0, mineDuty = 0;
    for (let k = 0; k < 7; k++) { const x = new Date(mon); x.setDate(mon.getDate() + k); R.blocksFor(s, x, N, STATE.ex).forEach(b => { let len = R.m(b.end) - R.m(b.start); if (len < 0) len += 1440; if (b.type === 'ME') personal += len; if (b.type === me.role) mineDuty += len; }); }
    const planned = (STATE.dates || []).filter(x => x.planner === me.role || x.announced_by === DB.uid).length;
    const myR = (STATE.ratings || []).filter(r => r.user_id === DB.uid), myAvg = myR.length ? (myR.reduce((a, r) => a + r.score, 0) / myR.length).toFixed(1) : '—';
    const partner = member(me.role === 'A' ? 'B' : 'A');
    const link = location.origin + location.pathname + '?join=' + STATE.family.invite_code + (DEMO ? '&demo=1&as=B' : '');
    return `<div class="card me"><div class="av" style="background:${me.color}">${esc(me.emoji)}</div><div><h2>${esc(me.name)}</h2><p class="muted small">${esc(STATE.family.name)}${partner ? ' · вместе с ' + esc(partner.name) : ''}</p></div><button class="btn ghost sm" data-q="profile">Изменить</button></div>
      <div class="card"><h2>Моя неделя</h2><div class="stats"><div><b>${(personal / 60).toFixed(0)} ч</b><span>свободного и личного времени</span></div><div><b>${(mineDuty / 60).toFixed(0)} ч</b><span>я с ребёнком / по делам</span></div><div><b>${planned}</b><span>свиданий придумано</span></div><div><b>${myAvg}</b><span>моя средняя оценка</span></div></div></div>
      ${partner ? '' : `<div class="card"><h2>Пригласи партнёра</h2><p>Код семьи: <b class="code">${esc(STATE.family.invite_code)}</b></p><p class="muted small">Отправь ссылку — по ней партнёр создаст свой аккаунт и попадёт в вашу семью.</p><div class="inrow"><input readonly value="${esc(link)}" id="inv"><button class="btn" data-q="copy">Скопировать</button></div></div>`}
      <div class="card"><h2>Личные заметки</h2><p class="muted small">Видишь только ты.</p><div class="inrow"><input id="note" placeholder="Мысль, просьба, идея"><button class="btn" data-q="note">Записать</button></div>${(STATE.notes || []).slice().reverse().map(n => `<p class="small">• ${esc(n.text)} <button class="link" data-delnote="${n.id}">×</button></p>`).join('')}</div>
      <div class="card"><h2>Настройки</h2><button class="btn wide" data-q="wizard">Настройки графика (мастер)</button>
        ${partner ? `<p class="muted small">Код семьи: ${esc(STATE.family.invite_code)}</p>` : ''}
        <button class="btn ghost wide" data-q="theme">Тема: ${document.documentElement.dataset.theme === 'light' ? 'светлая' : 'тёмная'}</button>
        <button class="btn ghost wide" data-q="import">Импорт данных Мухамадеевых</button>
        <button class="btn ghost wide" data-q="install">Как поставить на экран iPhone</button>
        <button class="btn ghost wide danger" data-q="out">Выйти</button></div>
      <p class="muted small center">Ритм семьи · v1 · 21.10.2026${DEMO ? ' · ДЕМО' : ''}</p>`;
  }

  // ---------- действия ----------
  function bindMain() {
    const app = $('#app');
    app.onclick = async ev => {
      const t = ev.target.closest('button, li[data-block], li[data-busy]'); if (!t) return;
      try {
        const d = t.dataset;
        if (d.q) return quick(d.q, t);
        if (d.sel) { STATE.sel = d.sel; return render(); }
        if (d.wk) { STATE.weekOff += +d.wk; STATE.sel = ''; return render(); }
        if (d.delex) { await DB.remove('rf_exceptions', d.delex); toast('Отменено'); return refresh(); }
        if (d.acc) return acceptReq(d.acc);
        if (d.dec) { await DB.update('rf_requests', d.dec, { status: 'declined' }); return refresh(); }
        if (d.delreq) { await DB.remove('rf_requests', d.delreq); return refresh(); }
        if (d.delidea) { await DB.remove('rf_ideas', d.delidea); return refresh(); }
        if (d.delnote) { await DB.remove('rf_notes', d.delnote); return refresh(); }
        if (d.block) return editBlock(t.closest('ol').dataset.day, d.block);
        if (d.busy) return busySheet(d.busy);
      } catch (e) { toast(errText(e)); }
    };
    const pf = $('#planForm'); if (pf) pf.onsubmit = async ev => { ev.preventDefault(); const s = S(), nd = R.nextDate(s, new Date()); await DB.upsertDate({ date: R.iso(nd), idea: pf.idea.value.trim(), planner: R.plannerFor(s, nd), announced_by: DB.uid }); toast('Озвучено. Партнёр увидит это у себя.'); refresh(); };
    document.querySelectorAll('.rateF').forEach(f => f.onsubmit = async ev => { ev.preventDefault(); const fd = new FormData(f); try { await DB.insert('rf_ratings', { date_id: f.dataset.date, score: +fd.get('score'), liked: fd.get('liked'), repeat: fd.get('repeat') }); toast('Оценка сохранена'); refresh(); } catch (e) { toast(errText(e)); } });
  }

  async function quick(q, btn) {
    const day = btn.dataset.d || R.iso(new Date()), N = NAMES(), s = S();
    if (q === 'exp') { const v = $('#exp').value.trim(); STATE.me = await DB.update('rf_members', DB.uid, { expect: v, expect_at: new Date().toISOString() }); toast('Записано'); return refresh(); }
    if (q === 'swap') return sheet(`<h2>Поменяться</h2><form class="form"><label>День<input type="date" name="d" value="${day}"></label><label>Что меняем<select name="k"><option value="swap_sad">Сад: отвезти и забрать</option><option value="swap_bath">Купание, укладывание и ночь</option></select></label><p class="muted small">Сейчас: сад — ${esc(N[R.sadFor(s, R.day(day), STATE.ex)])}, укладывание — ${esc(N[R.bathFor(s, R.day(day), STATE.ex)])}. Обмен применяется сразу, отменить можно на графике дня.</p><button class="btn" type="submit">Поменяться</button></form>`,
      async fd => { await DB.insert('rf_exceptions', { date: fd.get('d'), kind: fd.get('k'), payload: {} }); closeSheet(); toast('Поменялись'); refresh(); });
    if (q === 'closed') return sheet(`<h2>Сад закрыт</h2><form class="form"><label>День<input type="date" name="d" value="${day}"></label><p class="muted small">День с ребёнком делим пополам между вами.</p><button class="btn" type="submit">Отметить</button></form>`,
      async fd => { await DB.insert('rf_exceptions', { date: fd.get('d'), kind: 'sad_closed', payload: {} }); closeSheet(); toast('Отмечено: сад закрыт'); refresh(); });
    if (q === 'busy') return sheet(`<h2>Занятость</h2><form class="form"><label>Что<input name="t" required placeholder="Созвон, встреча, врач"></label><label>Кто<select name="u">${(STATE.members || []).map(x => `<option value="${x.user_id}" ${x.user_id === DB.uid ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label><label>День<input type="date" name="d" value="${day}"></label><div class="row2"><label>С<select name="s">${timeOpts('15:00')}</select></label><label>До<select name="e">${timeOpts('16:00')}</select></label></div><button class="btn" type="submit">Добавить</button></form>`,
      async fd => { await DB.insert('rf_busy', { title: fd.get('t'), user_id: fd.get('u'), date: fd.get('d'), start_t: fd.get('s'), end_t: fd.get('e') }); closeSheet(); toast('Добавлено'); refresh(); });
    if (q === 'text') return textSheet();
    if (q === 'pick') { const all = IDEAS.concat((STATE.ideas || []).map(x => x.text)); $('#planForm').idea.value = all[Math.floor(Math.random() * all.length)]; return; }
    if (q === 'addidea') { const v = $('#newIdea').value.trim(); if (!v) return; await DB.insert('rf_ideas', { text: v }); return refresh(); }
    if (q === 'pastdate') return sheet(`<h2>Прошедшее свидание</h2><form class="form"><label>Дата<input type="date" name="d" required max="${R.iso(new Date())}"></label><label>Что делали<input name="i" required></label><label>Кто придумал${roleSel('p', meRole())}</label><button class="btn" type="submit">Добавить</button></form>`,
      async fd => { await DB.upsertDate({ date: fd.get('d'), idea: fd.get('i'), planner: fd.get('p'), announced_by: DB.uid }); closeSheet(); toast('Добавлено. Теперь оцените его.'); refresh(); });
    if (q === 'note') { const v = $('#note').value.trim(); if (!v) return; await DB.insert('rf_notes', { text: v }); return refresh(); }
    if (q === 'copy') { const v = $('#inv').value; try { await navigator.clipboard.writeText(v); toast('Ссылка скопирована'); } catch (e) { $('#inv').select(); toast('Выдели и скопируй ссылку'); } return; }
    if (q === 'wizard') { STATE.wizard = { step: 0, draft: wizardDraft() }; return render(); }
    if (q === 'theme') { const n = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; document.documentElement.dataset.theme = n; try { localStorage.setItem('rs_theme', n); } catch (e) {} return render(); }
    if (q === 'import') return importOurs();
    if (q === 'install') return sheet(`<h2>На экран iPhone</h2><ol class="steps"><li>Открой эту страницу в <b>Safari</b>.</li><li>Нажми «Поделиться» (квадрат со стрелкой).</li><li>«На экран „Домой“» → «Добавить».</li></ol><p class="muted small">Вход сохранится: в следующий раз приложение откроется сразу.</p>`);
    if (q === 'out') return DB.signOut();
    if (q === 'profile') { const me = STATE.me; return sheet(`<h2>Профиль</h2><form class="form"><label>Имя<input name="n" value="${esc(me.name)}" required></label><p class="lbl">Цвет</p><div class="pick">${COLORS.map(c => `<label><input type="radio" name="c" value="${c}" ${c === me.color ? 'checked' : ''}><span style="background:${c}"></span></label>`).join('')}</div><p class="lbl">Значок</p><div class="pick">${EMOJI.map(c => `<label><input type="radio" name="e" value="${c}" ${c === me.emoji ? 'checked' : ''}><span>${c}</span></label>`).join('')}</div><button class="btn" type="submit">Сохранить</button></form>`,
      async fd => { STATE.me = await DB.update('rf_members', DB.uid, { name: fd.get('n').trim(), color: fd.get('c'), emoji: fd.get('e') }); closeSheet(); refresh(); }); }
  }

  function editBlock(dayIso, key) {
    const d = R.day(dayIso), b = R.blocksFor(S(), d, NAMES(), STATE.ex).find(x => x.key === key); if (!b) return;
    const TY = { A: NAMES().A, B: NAMES().B, TWO: 'Вдвоём', THREE: 'Втроём', ME: 'Личное время', Z: 'Сон' };
    sheet(`<h2>${esc(b.title)}</h2><p class="muted small">${fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}</p><form class="form"><div class="row2"><label>С<select name="s">${timeOpts(b.start)}</select></label><label>До<select name="e">${timeOpts(b.end)}</select></label></div>
      <label>Название<input name="t" value="${esc(b.title)}"></label><label>Подпись<input name="sub" value="${esc(b.sub)}"></label><label>Чей блок<select name="ty">${Object.keys(TY).map(k => `<option value="${k}" ${k === b.type ? 'selected' : ''}>${esc(TY[k])}</option>`).join('')}</select></label>
      <label>Применить<select name="scope"><option value="one">Только ${fmt(d, { day: 'numeric', month: 'long' })}</option><option value="all">Всегда (${({ wd: 'все будни', wed: 'все дни свиданий', sat: 'все субботы', sun: 'все воскресенья' })[b.dayKind]})</option></select></label>
      <p class="muted small">Имена в названии сами не меняются по очереди после ручной правки. Чтобы поменяться, лучше кнопка «Поменяться».</p>
      <button class="btn" type="submit">Сохранить</button><button class="btn ghost" type="button" data-a="reset">Вернуть как было</button></form>`,
      async fd => {
        const p = { key, start: fd.get('s'), end: fd.get('e'), type: fd.get('ty') };
        if (fd.get('t') !== b.title) p.title = fd.get('t'); if (fd.get('sub') !== b.sub) p.sub = fd.get('sub');
        if (fd.get('scope') === 'one') await DB.insert('rf_exceptions', { date: dayIso, kind: 'block_edit', payload: p });
        else { const st = S(); st.overrides = st.overrides || {}; st.overrides[b.dayKind + ':' + key] = p; STATE.family = await DB.update('rf_families', STATE.family.id, { settings: st }); }
        closeSheet(); toast('Сохранено'); refresh();
      },
      async a => {
        if (a !== 'reset') return;
        for (const e of (STATE.ex || []).filter(e => e.date === dayIso && e.kind === 'block_edit' && e.payload.key === key)) await DB.remove('rf_exceptions', e.id);
        const st = S(); if (st.overrides && st.overrides[b.dayKind + ':' + key]) { delete st.overrides[b.dayKind + ':' + key]; STATE.family = await DB.update('rf_families', STATE.family.id, { settings: st }); }
        closeSheet(); toast('Вернул как было'); refresh();
      });
  }

  function busySheet(id) {
    const bz = (STATE.busy || []).find(x => x.id === id); if (!bz) return;
    const blocks = R.blocksFor(S(), R.day(bz.date), NAMES(), STATE.ex), c = conflicts(bz, blocks);
    const kindOf = k => (k === 'drop' || k === 'pick') ? 'swap_sad' : (k === 'bath' || k === 'sleep') ? 'swap_bath' : null;
    const sw = c.map(x => kindOf(x.key)).find(Boolean);
    sheet(`<h2>📌 ${esc(bz.title)}</h2><p class="muted">${fmt(R.day(bz.date), { weekday: 'long', day: 'numeric', month: 'long' })}, ${bz.start_t}–${bz.end_t}</p>${c.length ? `<p class="late">Пересекается с «${esc(c[0].title)}»</p>` : ''}
      ${sw && bz.user_id === DB.uid ? `<button class="btn wide" data-a="ask">Предложить обмен партнёру</button>` : ''}<button class="btn ghost wide danger" data-a="del">Удалить занятость</button>`, null,
      async a => {
        if (a === 'del') { await DB.remove('rf_busy', id); closeSheet(); toast('Удалено'); refresh(); }
        if (a === 'ask') { await DB.insert('rf_requests', { date: bz.date, kind: sw, note: bz.title + ' ' + bz.start_t + '–' + bz.end_t }); closeSheet(); toast('Запрос отправлен партнёру'); refresh(); }
      });
  }
  async function acceptReq(id) {
    const r = (STATE.req || []).find(x => x.id === id); if (!r) return;
    await DB.insert('rf_exceptions', { date: r.date, kind: r.kind, payload: { request: id } });
    await DB.update('rf_requests', id, { status: 'accepted' }); toast('Обмен принят'); refresh();
  }

  // ----- «Опиши изменения»: разбор текста без ИИ -----
  const DAYW = { 'пн': 1, 'понедельник': 1, 'вт': 2, 'вторник': 2, 'ср': 3, 'сред': 3, 'чт': 4, 'четверг': 4, 'пт': 5, 'пятниц': 5, 'сб': 6, 'суббот': 6, 'вс': 0, 'воскресень': 0 };
  function parseText(text) {
    const out = [], now = new Date(); let lastDay = R.iso(now);
    const N = NAMES(), partnerRole = meRole() === 'A' ? 'B' : 'A', partner = member(partnerRole);
    text.split(/[\n;,.]+|\s+и\s+(?=(?:в|во|сегодня|завтра|послезавтра|\d))/i).map(x => x.trim()).filter(Boolean).forEach(fr => {
      const low = fr.toLowerCase(); let dd = null;
      if (/послезавтра/.test(low)) { const x = new Date(now); x.setDate(x.getDate() + 2); dd = x; }
      else if (/завтра/.test(low)) { const x = new Date(now); x.setDate(x.getDate() + 1); dd = x; }
      else if (/сегодня/.test(low)) dd = new Date(now);
      else { const dm = low.match(/(\d{1,2})[./](\d{1,2})/); if (dm) dd = new Date(now.getFullYear(), +dm[2] - 1, +dm[1], 12);
        else for (const k in DAYW) { if (new RegExp('(^|[^а-я])' + k).test(low)) { const x = new Date(now); let add = (DAYW[k] - x.getDay() + 7) % 7; x.setDate(x.getDate() + add); dd = x; break; } } }
      const di = dd ? R.iso(dd) : lastDay; lastDay = di;
      const who = partner && new RegExp(partner.name.slice(0, Math.max(3, partner.name.length - 2)), 'i').test(fr) ? partner.user_id : DB.uid;
      if (/сад/.test(low) && /закрыт|не работает|болеет|болен/.test(low)) { out.push({ kind: 'ex', ex: 'sad_closed', date: di, label: 'Сад закрыт' }); return; }
      if (/помен|обмен|меня[ея]м|меняюсь|махн/.test(low)) { const k = /уклад|купа|ноч|сп(ит|ать)/.test(low) ? 'swap_bath' : 'swap_sad'; out.push({ kind: 'ex', ex: k, date: di, label: k === 'swap_sad' ? 'Обмен: сад' : 'Обмен: укладывание' }); return; }
      let tm = fr.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(?:-|–|—|до)\s*(\d{1,2})(?:[:.](\d{2}))?/);
      let s, e;
      if (tm) { s = R.hm(+tm[1] * 60 + (+tm[2] || 0)); e = R.hm(+tm[3] * 60 + (+tm[4] || 0)); }
      else { const one = fr.match(/(?:в|с)\s+(\d{1,2})(?:[:.](\d{2}))?/i); if (one) { s = R.hm(+one[1] * 60 + (+one[2] || 0)); e = R.hm(R.m(s) + 60); } }
      if (!s) return;
      let title = fr.replace(/(\d{1,2})[./](\d{1,2})/g, '').replace(/(?:с|в)?\s*\d{1,2}(?:[:.]\d{2})?\s*(?:-|–|—|до)\s*\d{1,2}(?:[:.]\d{2})?/g, '').replace(/(?:^|\s)(?:в|во|с)\s+\d{1,2}(?:[:.]\d{2})?/gi, '')
        .replace(/сегодня|послезавтра|завтра|у меня|у нас|в\s+(?:понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)|во\s+вторник/gi, '').replace(/\s+/g, ' ').trim();
      title = title ? title[0].toUpperCase() + title.slice(1) : 'Занят(а)';
      out.push({ kind: 'busy', date: di, s, e, title, user: who, label: `${title}, ${s}–${e} (${esc(((STATE.members || []).find(x => x.user_id === who) || {}).name || '')})` });
    });
    return out;
  }
  function textSheet() {
    sheet(`<h2>Опиши изменения</h2><form class="form"><textarea name="t" rows="4" placeholder="во вторник созвон 15:00–16:00, в пятницу сад закрыт, завтра меняемся укладыванием" required></textarea><button class="btn" type="submit">Разобрать</button></form><div id="parsed"></div>`,
      async fd => {
        const items = parseText(fd.get('t')); const box = $('#parsed');
        if (!items.length) { box.innerHTML = '<p class="late">Не нашёл ни дня, ни времени. Пример: «в четверг встреча 11–12».</p>'; $('#sheet [type=submit]').disabled = false; return; }
        box.innerHTML = `<h3>Добавлю:</h3>${items.map(x => `<p>• ${fmt(R.day(x.date), { weekday: 'short', day: 'numeric', month: 'short' })}: ${x.kind === 'busy' ? x.label : x.label}</p>`).join('')}<button class="btn wide" data-a="apply">Подтвердить</button>`;
        STATE.parsed = items; $('#sheet [type=submit]').disabled = false;
      },
      async a => {
        if (a !== 'apply') return;
        for (const x of STATE.parsed || []) { if (x.kind === 'busy') await DB.insert('rf_busy', { title: x.title, user_id: x.user, date: x.date, start_t: x.s, end_t: x.e }); else await DB.insert('rf_exceptions', { date: x.date, kind: x.ex, payload: {} }); }
        closeSheet(); toast('Добавлено: ' + (STATE.parsed || []).length); refresh();
      });
  }

  // ----- импорт наших данных -----
  async function importOurs() {
    const roleBy = nm => ((STATE.members || []).find(x => x.name.toLowerCase().startsWith(nm)) || {}).role;
    const ra = roleBy('айрат') || 'A', rl = ra === 'A' ? 'B' : 'A';
    const st = S();
    Object.assign(st, { ready: true, child: 'Усман', childWith: 'Усманом', names: { [ra]: 'Айрат', [rl]: 'Лейла' } });
    st.school = { on: true, days: [1, 2, 3, 4, 5], start: '09:00', end: '16:50', travel: 20 };
    st.sad = { first: ra, start: '2026-10-21' }; st.bath = { first: ra, start: '2026-10-21' };
    st.date = { on: true, dow: 3, start: '09:00', end: '13:00', plannerFirst: rl, plannerWeek: '2026-10-19', deadlineDow: 1, deadline: '20:00' };
    st.eve = Object.assign(st.eve, { kidWith: ra, cook: rl }); st.weekend = { satFirst: rl, satWeek: '2026-10-19', council: '20:30' };
    STATE.family = await DB.update('rf_families', STATE.family.id, { settings: st });
    const d1 = await DB.upsertDate({ date: '2026-10-14', idea: 'Гольф и стратегическая сессия по кистям', planner: ra });
    await DB.upsertDate({ date: '2026-10-21', idea: 'Уличный рынок и 5 незнакомых блюд', planner: rl });
    const mine = meRole() === ra ? { score: 8, liked: '' } : { score: 9, liked: 'Как мы генерили идеи за кофе и были увлечены друг другом' };
    await loadAll();
    if (!(STATE.ratings || []).some(r => r.date_id === d1.id && r.user_id === DB.uid)) await DB.insert('rf_ratings', { date_id: d1.id, score: mine.score, liked: mine.liked, repeat: 'да' });
    toast('Импортировано: график, 2 свидания и твоя оценка'); refresh();
  }

  // ---------- старт ----------
  async function boot() {
    STATE.session = await DB.session();
    if (!STATE.session) { render(); return; }
    if (fromCache()) render();
    try { await loadAll(); STATE.cached = false; } catch (e) { if (!STATE.cached) { STATE.loaded = true; toast(errText(e)); } }
    render();
  }
  document.getElementById('nav').onclick = ev => { const b = ev.target.closest('button'); if (!b) return; STATE.tab = b.dataset.tab; try { localStorage.setItem('rs_tab', STATE.tab); } catch (e) {} if (STATE.tab === 'week') { STATE.weekOff = 0; STATE.sel = R.iso(new Date()); } render(); window.scrollTo(0, 0); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && STATE.me) refresh(); });
  setInterval(() => { if (document.visibilityState === 'visible' && STATE.me && STATE.tab === 'today' && !$('#sheet').classList.contains('on')) render(); }, 60000);
  if (!DEMO && DB.sb) DB.sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_IN' && !STATE.me) boot(); });
  boot();
})();
