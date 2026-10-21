// «Ритм семьи»: генератор графика из настроек семьи. Без зависимостей, работает и в браузере, и в node (для проверок).
(function (root) {
  const DEFAULTS = {
    ready: false,
    child: '',
    wake: '07:30', bed: '23:30',
    school: { on: true, days: [1, 2, 3, 4, 5], start: '09:00', end: '16:50', travel: 20 },
    sad: { first: 'A', start: '2026-10-21' },          // отвозит/забирает: через день по дням сада
    bath: { first: 'A', start: '2026-10-21' },         // купает, укладывает и спит с ребёнком: через день, и в выходные
    date: { on: true, dow: 3, start: '09:00', end: '13:00', plannerFirst: 'B', plannerWeek: '2026-10-19', deadlineDow: 1, deadline: '20:00' },
    eve: { kidWith: 'A', cook: 'B', dinner: '18:30', dinnerEnd: '19:30', together: '20:30', togetherEnd: '22:00' },
    weekend: { satFirst: 'B', satWeek: '2026-10-19', council: '20:30' },
    overrides: {}
  };

  const m = s => { const [h, mm] = String(s).split(':').map(Number); return h * 60 + (mm || 0); };
  const hm = n => { n = ((n % 1440) + 1440) % 1440; return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); };
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const day = s => { const [y, mo, d] = s.split('-').map(Number); return new Date(y, mo - 1, d, 12); };
  const other = r => (r === 'A' ? 'B' : 'A');
  const par = n => ((n % 2) + 2) % 2;
  const daysBetween = (a, b) => Math.round((day(iso(b)) - day(iso(a))) / 864e5);
  const mondayOf = d => { const x = day(iso(d)); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };

  function merge(base, extra) {
    const out = JSON.parse(JSON.stringify(base));
    for (const k in extra || {}) {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && out[k] && typeof out[k] === 'object') out[k] = merge(out[k], extra[k]);
      else out[k] = extra[k];
    }
    return out;
  }
  const settings = s => merge(DEFAULTS, s || {});

  // «с кем»: Усман → Усманом, Аня → Аней, Маша → Машей, Тимур → Тимуром
  function instr(n) {
    n = (n || '').trim(); if (!n) return '';
    const l = n.slice(-1).toLowerCase(), p = n.slice(-2, -1).toLowerCase();
    if (l === 'а') return n.slice(0, -1) + ('жшчщц'.includes(p) ? 'ей' : 'ой');
    if (l === 'я') return n.slice(0, -1) + 'ей';
    if (l === 'й') return n.slice(0, -1) + 'ем';
    if (l === 'ь') return n.slice(0, -1) + 'ем';
    return n + ('жшчщц'.includes(l) ? 'ем' : 'ом');
  }

  function isSchoolDay(S, d) { return !!S.school.on && S.school.days.includes(d.getDay()); }

  // Сколько дней сада между стартом и датой (со знаком) — по нему чередуем «кто везёт».
  function schoolDaysFrom(S, start, d) {
    const a = day(start), b = day(iso(d));
    if (+a === +b) return 0;
    const step = b > a ? 1 : -1; let n = 0; const x = new Date(a);
    while (+x !== +b) { x.setDate(x.getDate() + step); if (isSchoolDay(S, x)) n += step; }
    return n;
  }
  function exFor(ex, d, kind) { const k = iso(d); return (ex || []).filter(e => e.date === k && e.kind === kind); }

  function sadFor(S, d, ex) {
    let r = par(schoolDaysFrom(S, S.sad.start, d)) === 0 ? S.sad.first : other(S.sad.first);
    if (exFor(ex, d, 'swap_sad').length % 2) r = other(r);
    return r;
  }
  function bathFor(S, d, ex) {
    let r = par(daysBetween(day(S.bath.start), d)) === 0 ? S.bath.first : other(S.bath.first);
    if (exFor(ex, d, 'swap_bath').length % 2) r = other(r);
    return r;
  }
  function plannerFor(S, d) {
    const w = Math.round((mondayOf(d) - mondayOf(day(S.date.plannerWeek))) / (7 * 864e5));
    return par(w) === 0 ? S.date.plannerFirst : other(S.date.plannerFirst);
  }
  function satFor(S, d) {
    const w = Math.round((mondayOf(d) - mondayOf(day(S.weekend.satWeek))) / (7 * 864e5));
    return par(w) === 0 ? S.weekend.satFirst : other(S.weekend.satFirst);
  }
  function isDateDay(S, d) { return !!S.date.on && d.getDay() === S.date.dow; }

  // Блок: {key, start, end, title, sub, type}. type: 'A' | 'B' (роль партнёра) | TWO | THREE | ME | Z.
  function kind(S, d) { const w = d.getDay(); if (w === 6) return 'sat'; if (w === 0) return 'sun'; return isSchoolDay(S, d) ? 'wd' : 'sat'; }

  function blocksFor(S, d, names, ex) {
    S = settings(S); names = names || { A: 'Партнёр А', B: 'Партнёр Б' };
    const N = r => names[r] || r, kid = S.childWith || instr(S.child) || 'ребёнком', kidN = S.child || 'ребёнок';
    const K = kind(S, d), b = bathFor(S, d, ex), closed = exFor(ex, d, 'sad_closed').length > 0;
    const L = [];
    const add = (key, start, end, title, sub, type) => { if (m(end) !== m(start)) L.push({ key, start, end, title, sub: sub || '', type }); };
    const evening = (afterKid) => {
      add('dinner', S.eve.dinner, S.eve.dinnerEnd, 'Ужин втроём', 'Телефоны в корзине', 'THREE');
      add('bath', S.eve.dinnerEnd, S.eve.together, N(b) + ' купает и укладывает', N(other(b)) + ': 30 минут выдохнуть', b);
      add('together', S.eve.together, S.eve.togetherEnd, 'Вдвоём', '20 минут разговора без телефонов, потом фильм или чтение', 'TWO');
      add('personal', S.eve.togetherEnd, S.bed, 'Личное время', 'Проекты, книга, своё. Вечерний чек-ин', 'ME');
    };
    if (K === 'wd') {
      const x = sadFor(S, d, ex), st = m(S.school.start), en = m(S.school.end), tr = +S.school.travel || 0;
      const leave = hm(st - tr), pick = hm(en - tr);
      add('morning', S.wake, leave, 'Утро втроём', 'Подъём, завтрак, объятие перед выходом', 'THREE');
      if (closed) {
        const mid = hm(Math.round((st + en) / 2 / 15) * 15);
        add('closed1', leave, mid, N(x) + ' с ' + kid, 'Сад закрыт. ' + N(other(x)) + ': своё время', x);
        add('closed2', mid, S.school.end, N(other(x)) + ' с ' + kid, 'Сад закрыт. ' + N(x) + ': своё время', other(x));
      } else {
        add('drop', leave, S.school.start, N(x) + ' отвозит в сад', N(other(x)) + ': начало своего утра', x);
        const split = Math.min(Math.max(m('13:00'), st), en - tr);
        if (isDateDay(S, d)) {
          const ds = Math.max(m(S.date.start), st), de = Math.min(m(S.date.end), en - tr);
          add('free0', S.school.start, hm(ds), 'Свободное время', kidN + ' в саду', 'ME');
          add('date', hm(ds), hm(de), 'Свидание вдвоём', 'Активное и новое. Телефоны в сумке', 'TWO');
          add('free2', hm(de), pick, 'Свободное время', 'Обед, спорт, свои дела. ' + kidN + ' в саду', 'ME');
        } else {
          add('free1', S.school.start, hm(split), 'Свободное время: фокус', 'Проекты, глубокая работа. ' + kidN + ' в саду', 'ME');
          add('free2', hm(split), pick, 'Свободное время', 'Обед, спорт, дела. ' + kidN + ' в саду', 'ME');
        }
        add('pick', pick, S.school.end, N(x) + ' забирает из сада', N(other(x)) + ': ещё ' + tr + ' минут своего времени', x);
      }
      const kw = S.eve.kidWith;
      add('kid', S.school.end, S.eve.dinner, N(kw) + ' с ' + kid + ', ' + N(S.eve.cook) + ' готовит', 'Понятные роли у обоих', kw);
      evening();
    } else if (K === 'sat') {
      const s = satFor(S, d), o = other(s);
      add('satAm', S.wake, '12:00', N(s) + ' с ' + kid, N(o) + ': личное время', s);
      add('lunch', '12:00', '14:00', 'Обед втроём', '', 'THREE');
      add('satPm', '14:00', '18:00', N(o) + ' с ' + kid, N(s) + ': личное время', o);
      add('eve3', '18:00', '20:00', 'Вечер втроём', 'Ужин, игра, прогулка', 'THREE');
      add('bath', '20:00', S.eve.together, N(b) + ' купает и укладывает', N(other(b)) + ': выдохнуть', b);
      add('together', S.eve.together, S.eve.togetherEnd, 'Вдвоём', 'Без телефонов первые 30 минут', 'TWO');
      add('personal', S.eve.togetherEnd, S.bed, 'Личное время', '', 'ME');
    } else {
      add('sunAm', S.wake, '09:00', 'Утро втроём', 'Без спешки', 'THREE');
      add('trip', '09:00', '18:00', 'День втроём', 'Море, остров, новое место', 'THREE');
      add('sunEve', '18:00', '20:00', 'Ужин, отдых', '', 'THREE');
      add('bath', '20:00', S.weekend.council, N(b) + ' купает и укладывает', '', b);
      add('council', S.weekend.council, hm(m(S.weekend.council) + 30), 'Семейный совет', 'Неделя, свидание, деньги, просьбы', 'TWO');
      add('together', hm(m(S.weekend.council) + 30), S.eve.togetherEnd, 'Вдвоём', '', 'TWO');
      add('personal', S.eve.togetherEnd, S.bed, 'Личное время', '', 'ME');
    }
    add('sleep', S.bed, S.wake, 'Сон', 'С ' + kid + ' спит ' + N(b) + '. Второй высыпается', 'Z');

    // правки: «всегда» (S.overrides[kind:key]) и «только этот день» (исключение block_edit)
    const dk = isDateDay(S, d) && K === 'wd' ? 'wed' : K;
    const one = {}; exFor(ex, d, 'block_edit').forEach(e => { one[e.payload.key] = e.payload; });
    return L.map(bl => {
      const o = Object.assign({}, (S.overrides || {})[dk + ':' + bl.key] || {}, one[bl.key] || {});
      if (o.hidden) return null;
      return Object.assign({}, bl, o.start ? { start: o.start } : {}, o.end ? { end: o.end } : {}, o.title ? { title: o.title } : {}, o.sub !== undefined ? { sub: o.sub } : {}, o.type ? { type: o.type } : {}, { dayKind: dk });
    }).filter(Boolean).sort((a, c) => (a.key === 'sleep') - (c.key === 'sleep') || m(a.start) - m(c.start));
  }

  function liveIndex(blocks, now) {
    const n = now.getHours() * 60 + now.getMinutes();
    for (let i = 0; i < blocks.length; i++) {
      const s = m(blocks[i].start), e = m(blocks[i].end);
      if (e > s ? (n >= s && n < e) : (n >= s || n < e)) return i;
    }
    return -1;
  }

  // Ближайшее свидание: сегодня (если ещё не закончилось) или следующий день свидания.
  function nextDate(S, now) {
    S = settings(S); const d = day(iso(now));
    for (let i = 0; i < 8; i++) {
      const x = new Date(d); x.setDate(d.getDate() + i);
      if (isDateDay(S, x) && !(i === 0 && now.getHours() * 60 + now.getMinutes() >= m(S.date.end))) return x;
    }
    return null;
  }
  function deadlineFor(S, dateDay) {
    S = settings(S); const x = new Date(dateDay);
    while (x.getDay() !== S.date.deadlineDow) x.setDate(x.getDate() - 1);
    const [h, mm] = S.date.deadline.split(':').map(Number); x.setHours(h, mm, 0, 0);
    return x;
  }

  const api = { instr, DEFAULTS, settings, merge, m, hm, iso, day, other, mondayOf, isSchoolDay, sadFor, bathFor, plannerFor, satFor, isDateDay, blocksFor, liveIndex, nextDate, deadlineFor, kind };
  if (typeof module !== 'undefined') module.exports = api; else root.RS = api;
})(typeof window !== 'undefined' ? window : globalThis);
