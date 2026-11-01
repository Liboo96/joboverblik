import { escapeHtml } from './dom.js?v=demo-10';
import { getVisibleRecords } from './visible-records.mjs?v=demo-10';
import { renderRecordCard } from './record-card.js?v=demo-10';
import { initNotices } from './notices.js?v=demo-10';
import { initFollowup } from './followup.js?v=demo-10';
import {
  statuses,
  localDay,
  daysBetween,
  pending,
  alerts,
  validJob,
  isActivity,
  statusesFor,
  needsFollowup,
} from './logic.mjs?v=demo-10';
import { initDemo } from './demo.js?v=demo-10';
import { createDemoRecords } from './sample.mjs?v=demo-10';
const selectElement = (selector) => document.querySelector(selector),
  storageKey = 'joboverblik.demo.v1',
  seenKey = 'joboverblik.demo.seen.v1';
let jobs = [],
  seen = {},
  view = 'all',
  toastTimer;
function toast(s) {
  selectElement('#toast').textContent = s;
  selectElement('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => selectElement('#toast').classList.remove('visible'), 4500);
}
// Keep these session keys stable so existing demo tabs survive code updates.
// This demo intentionally never reads the personal app's browser storage.
let loadError = false;
try {
  const saved = JSON.parse(
    sessionStorage.getItem(storageKey) || JSON.stringify(createDemoRecords()),
  );
  if (!Array.isArray(saved) || !saved.every(validJob)) throw Error();
  jobs = saved;
  seen = JSON.parse(sessionStorage.getItem(seenKey) || '{}') || {};
} catch {
  loadError = true;
  toast('Gemte oplysninger kunne ikke læses. Eksportér en kopi før du ændrer noget.');
}
// Update in-memory state only after browser storage accepts the entire change.
function save(next) {
  if (loadError) {
    toast('Genindlæs en gyldig sikkerhedskopi før du gemmer nye oplysninger.');
    return false;
  }
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(next));
    jobs = next;
    return true;
  } catch {
    toast('Kunne ikke gemme. Browserens lager er muligvis fyldt eller blokeret.');
    return false;
  }
}
const followupUI = initFollowup({ getJobs: () => jobs, save, render, toast });
const noticeUI = initNotices({ getJobs: () => jobs, save, render, toast, edit });
function allAlerts() {
  return jobs.flatMap((record) => alerts(record).map((a) => ({ ...a, job: record })));
}
// One render pass updates the summary, filters, navigation and record actions.
function render() {
  const today = localDay(),
    active = jobs.filter((record) => !isActivity(record) && record.status !== 'closed'),
    a = allAlerts();
  selectElement('#today').textContent = new Intl.DateTimeFormat('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  selectElement('#n-active').textContent = active.length;
  selectElement('#n-deadline').textContent = active.filter(
    (record) =>
      pending(record) &&
      record.deadline &&
      daysBetween(today, record.deadline) >= 0 &&
      daysBetween(today, record.deadline) <= 7,
  ).length;
  selectElement('#n-follow').textContent = jobs.filter((record) =>
    needsFollowup(record, today),
  ).length;
  selectElement('#n-interview').textContent = active.filter(
    (record) => record.status === 'interview',
  ).length;
  selectElement('#reminders').innerHTML = a.length
    ? `<div class="reminder">
      <div><strong>${a.length} ${a.length === 1 ? 'påmindelse venter' : 'påmindelser venter'} på dig</strong>
      <p>${escapeHtml(a[0].job.company)} · ${escapeHtml(a[0].text)}${a.length > 1 ? ` Og ${a.length - 1} mere.` : ''}</p></div>
      <button id="show-alerts">Se påmindelser</button>
    </div>`
    : '';
  selectElement('#show-alerts')?.addEventListener('click', () => showNotices(a));
  const list = getVisibleRecords(jobs, {
    view,
    query: selectElement('#search').value,
    status: selectElement('#status-filter').value,
    sort: selectElement('#sort').value,
    today,
  });
  selectElement('#view-title').textContent = {
    all: 'Ansøgninger og aktiviteter',
    activities: 'Dine aktiviteter',
    followup: 'Din opfølgning',
    action: 'Kræver handling',
    closed: 'Afsluttede poster',
  }[view];
  selectElement('#count').textContent = `${list.length} ${list.length === 1 ? 'post' : 'poster'}`;
  document.querySelectorAll('.nav').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
    if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.dispatchEvent(new CustomEvent('viewchange', { detail: view }));
  selectElement('#jobs').innerHTML = list.length
    ? list.map((record) => renderRecordCard(record, today)).join('')
    : `<div class="empty">
      <h3>${jobs.length ? 'Her er der ro lige nu' : 'Plads til din næste mulighed'}</h3>
      <p>${jobs.length ? 'Ingen poster matcher denne visning. Prøv en anden status eller søgning.' : 'Tilføj en stilling, du overvejer at søge. Så holder vi styr på datoerne sammen.'}</p>
      <button class="primary" id="empty-add">Tilføj din første post</button>
    </div>`;
  document
    .querySelectorAll('[data-followup]')
    .forEach((button) =>
      button.addEventListener('click', () => followupUI.open(button.dataset.followup)),
    );
  document
    .querySelectorAll('[data-edit]')
    .forEach((button) => button.addEventListener('click', () => edit(button.dataset.edit)));
  selectElement('#empty-add')?.addEventListener('click', () => edit());
}
function syncEditorStatus(value) {
  const form = selectElement('#job-form'),
    activity = form.elements.kind.value === 'activity';
  form.elements.status.innerHTML = Object.entries(statusesFor({ kind: form.elements.kind.value }))
    .map(([field, v]) => `<option value="${field}">${v}</option>`)
    .join('');
  if (value && Object.hasOwn(statusesFor({ kind: form.elements.kind.value }), value))
    form.elements.status.value = value;
  selectElement('#deadline-label').hidden = activity;
  selectElement('#activity-date-label').hidden = !activity;
}
function edit(id) {
  const record = jobs.find((record) => record.id === id),
    form = selectElement('#job-form');
  form.reset();
  form.elements.kind.value = record?.kind || 'job';
  syncEditorStatus(record?.status);
  for (const field of [
    'id',
    'title',
    'company',
    'url',
    'deadline',
    'activityDate',
    'followup',
    'notes',
  ])
    form.elements[field].value = record?.[field] ?? '';
  selectElement('#form-title').textContent = record
    ? 'Rediger post'
    : 'Tilføj ansøgning eller aktivitet';
  selectElement('#delete').hidden = !record;
  selectElement('#editor').showModal();
}
selectElement('#form-kind').addEventListener('change', () => syncEditorStatus());
function showNotices(a) {
  if (noticeUI.show(a)) {
    for (const x of a) seen[x.key] = localDay();
    try {
      sessionStorage.setItem(seenKey, JSON.stringify(seen));
    } catch {}
  }
}
selectElement('#status-filter').insertAdjacentHTML(
  'beforeend',
  Object.entries(statuses)
    .map(([field, v]) => `<option value="${field}">${v}</option>`)
    .join(''),
);
selectElement('#followup-summary').addEventListener('click', () => {
  view = 'followup';
  selectElement('#search').value = '';
  selectElement('#status-filter').value = '';
  selectElement('#sort').value = 'followup';
  render();
  selectElement('.workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
selectElement('#add').addEventListener('click', () => edit());
for (const id of ['close', 'cancel'])
  selectElement('#' + id).addEventListener('click', () => selectElement('#editor').close());
selectElement('#notice-close').addEventListener('click', () => selectElement('#notice').close());
selectElement('#job-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.currentTarget,
    record = Object.fromEntries(new FormData(form));
  for (const field of ['title', 'company', 'url', 'notes']) record[field] = record[field].trim();
  record.company =
    record.company || (isActivity(record) ? 'Arrangør ikke oplyst' : 'Virksomhed ikke oplyst');
  if (isActivity(record)) record.deadline = '';
  else record.activityDate = '';
  const old = jobs.find((x) => x.id === record.id);
  record.id = record.id || crypto.randomUUID();
  record.createdAt = old?.createdAt || new Date().toISOString();
  if (old?.demo) record.demo = true;
  if (old?.sourceKey) record.sourceKey = old.sourceKey;
  if (old?.appliedDate) record.appliedDate = old.appliedDate;
  if (old?.lastFollowupAt) record.lastFollowupAt = old.lastFollowupAt;
  if (!validJob(record)) {
    toast(
      'Tjek felterne. Stilling og virksomhed skal udfyldes. Links skal begynde med https:// eller http://.',
    );
    return;
  }
  if (save(old ? jobs.map((x) => (x.id === record.id ? record : x)) : [record, ...jobs])) {
    selectElement('#editor').close();
    render();
    toast('Posten er gemt');
  }
});
selectElement('#delete').addEventListener('click', () => {
  const id = selectElement('#job-form').elements.id.value;
  if (confirm('Vil du slette denne post?'))
    if (save(jobs.filter((record) => record.id !== id))) {
      selectElement('#editor').close();
      render();
      toast('Posten er slettet');
    }
});
document.querySelectorAll('.nav').forEach((button) =>
  button.addEventListener('click', () => {
    view = button.dataset.view;
    render();
  }),
);
for (const id of ['search', 'status-filter', 'sort'])
  selectElement('#' + id).addEventListener(id === 'search' ? 'input' : 'change', render);
initDemo({
  addRecord: () => edit(),
  changeStatus: () => {
    const job =
      jobs.find((record) => record.id === 'demo-draft') ||
      jobs.find((record) => !isActivity(record));
    edit(job?.id);
  },
  planFollowup: () => {
    const job =
      jobs.find((record) => record.id === 'demo-office' && record.status !== 'closed') ||
      jobs.find((record) => !isActivity(record) && record.status !== 'closed');
    if (job) followupUI.open(job.id);
    else {
      toast('Tilføj en stilling først, så du kan planlægge opfølgning.');
      edit();
    }
  },
  reset: () => {
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());
    if (save(createDemoRecords())) {
      seen = {};
      sessionStorage.removeItem(seenKey);
      view = 'all';
      selectElement('#search').value = '';
      selectElement('#status-filter').value = '';
      render();
      toast('Demoen er klar fra start igen.');
    }
  },
  showReminders: () => {
    const a = allAlerts();
    if (a.length) showNotices(a);
    else toast('Ingen påmindelser lige nu. Vælg Start forfra for at prøve igen.');
  },
});
render();
setInterval(render, 60000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) render();
});
window.addEventListener('storage', (e) => {
  if (e.key === storageKey) {
    try {
      const next = JSON.parse(e.newValue || '[]');
      if (Array.isArray(next) && next.every(validJob)) {
        jobs = next;
        render();
      }
    } catch {}
  }
});
