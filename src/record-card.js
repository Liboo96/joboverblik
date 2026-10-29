import {
  daysBetween,
  followupState,
  isActivity,
  localDay,
  pending,
  recordDate,
  statuses,
} from './logic.mjs?v=demo-10';
import { escapeHtml } from './dom.js?v=demo-10';

function formatDate(date) {
  if (!date) return 'Ingen frist';
  return new Intl.DateTimeFormat('da-DK', {
    day: 'numeric',
    month: 'short',
    year: date.slice(0, 4) !== localDay().slice(0, 4) ? 'numeric' : undefined,
  }).format(new Date(date + 'T12:00:00'));
}

function followupLabel(record, today) {
  const state = followupState(record, today);
  if (state === 'due') return 'Følg op nu';
  if (state === 'needs-date') return 'Planlæg opfølgning';
  return record.followup ? 'Ændr opfølgning' : 'Planlæg opfølgning';
}

function renderFollowup(record, today) {
  let history = '';
  if (record.followup) {
    history = `<div class="company ${record.followup <= today ? 'alert-date' : ''}">Følg op ${formatDate(record.followup)}</div>`;
  } else if (record.lastFollowupAt) {
    history = `<div class="company">Fulgt op ${formatDate(record.lastFollowupAt)}</div>`;
  }
  if (record.status === 'closed') return history;
  return `${history}
    <button class="followup-action" data-followup="${escapeHtml(record.id)}">${followupLabel(record, today)}</button>`;
}

/** Render one record. app.js binds actions after replacing the list's HTML. */
export function renderRecordCard(record, today) {
  const date = recordDate(record);
  const distance = date ? daysBetween(today, date) : null;
  let dateClass = '';
  if (pending(record) && distance !== null) {
    dateClass = distance < 0 ? 'overdue' : distance <= 3 ? 'alert-date' : '';
  }
  return `
    <article class="job">
      <div>
        <button class="job-title" data-edit="${escapeHtml(record.id)}">${escapeHtml(record.title)}</button>
        ${isActivity(record) ? '<span class="activity-tag">Aktivitet</span>' : ''}
        ${record.url ? `<a class="job-link" href="${escapeHtml(record.url)}" target="_blank" rel="noopener noreferrer">${isActivity(record) ? 'Åbn link' : 'Åbn opslag'}</a>` : ''}
        <div class="company">${escapeHtml(record.company)}</div>
        ${record.notes ? `<div class="job-note">${escapeHtml(record.notes)}</div>` : ''}
      </div>
      <div class="job-status">
        <small>Status</small>
        <span class="badge ${escapeHtml(record.status)}">${statuses[record.status]}</span>
      </div>
      <div class="job-deadline">
        <small>${isActivity(record) ? 'Aktivitetsdato' : 'Ansøgningsfrist'}</small>
        <span class="date ${dateClass}">${date ? formatDate(date) : isActivity(record) ? 'Ingen dato' : 'Ingen frist'}${distance === 0 ? ' · i dag' : ''}</span>
        ${renderFollowup(record, today)}
      </div>
      <button class="edit" data-edit="${escapeHtml(record.id)}" aria-label="Rediger ${escapeHtml(record.title)}">Rediger</button>
    </article>`;
}
