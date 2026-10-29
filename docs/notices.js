import { escapeHtml } from './dom.js?v=demo-10';
import {
  alerts,
  localDay,
  followupState,
  scheduleFollowup,
  finishFollowup,
  isActivity,
} from './logic.mjs?v=demo-10';
const formatDate = (date) =>
  new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long' }).format(
    new Date(date + 'T12:00:00'),
  );
export function initNotices({ getJobs, save, render, toast, edit }) {
  const dialog = document.querySelector('#notice'),
    items = document.querySelector('#notice-items');
  let ids = [],
    selected = new Set(),
    messages = new Map(),
    batchDate = '';
  const get = (id) => getJobs().find((record) => record.id === id);
  // Batch date changes are saved together, preserving every record not in the batch.
  function commit(changes) {
    const map = new Map(changes.map((record) => [record.id, record]));
    if (!save(getJobs().map((record) => map.get(record.id) || record))) return false;
    render();
    return true;
  }
  function renderBatchForm(followups) {
    if (followups.length < 2) return '';
    return `
      <form class="notice-batch">
        <div><strong>Samme opfølgningsdato for flere?</strong>
          <span>Vælg posterne nedenfor, vælg én dato og gem dem samlet.</span></div>
        <label>Fælles opfølgningsdato
          <input type="date" id="notice-batch-date" value="${escapeHtml(batchDate)}" required>
        </label>
        <button class="primary" type="submit">Gem for valgte</button>
      </form>`;
  }

  function renderNoticeRow(record, followupCount) {
    const needsAction = ['due', 'needs-date'].includes(followupState(record));
    const hasMessage = messages.has(record.id);
    const canFinishActivity = isActivity(record) && record.status === 'planned';
    const canSelect = needsAction && !hasMessage && followupCount > 1;
    const companyAlreadyInTitle = record.title
      .toLocaleLowerCase('da')
      .includes(record.company.toLocaleLowerCase('da'));
    const message = hasMessage
      ? `<p class="notice-success" role="status">${escapeHtml(messages.get(record.id))}</p>`
      : `<p>${alerts(record)
          .map((alert) => escapeHtml(alert.text))
          .join('<br>')}</p>`;
    const scheduleForm =
      needsAction && !hasMessage
        ? `
      <form class="notice-row-form" data-schedule-id="${escapeHtml(record.id)}">
        <label>Opfølgningsdato
          <input type="date" name="date" value="${escapeHtml(record.followup || '')}"
            required aria-label="Opfølgningsdato for ${escapeHtml(record.title)}">
        </label>
        <button class="primary" type="submit">Gem dato</button>
        <button type="button" data-done-id="${escapeHtml(record.id)}">Har fulgt op</button>
      </form>`
        : '';
    return `
      <section class="notice-row" data-notice-row="${escapeHtml(record.id)}">
        <div class="notice-row-heading">
          ${
            canSelect
              ? `<input class="notice-select" type="checkbox"
            data-select-id="${escapeHtml(record.id)}"
            aria-label="Vælg til fælles opfølgning: ${escapeHtml(record.title)}"
            ${selected.has(record.id) ? 'checked' : ''}>`
              : ''
          }
          <div><h3>${escapeHtml(record.title)}</h3>
            ${companyAlreadyInTitle ? '' : `<span class="notice-company">${escapeHtml(record.company)}</span>`}
          </div>
        </div>
        ${message}
        ${scheduleForm}
        ${
          canFinishActivity && !hasMessage
            ? `<button class="notice-direct"
          data-activity-done="${escapeHtml(record.id)}">Markér som gennemført</button>`
            : ''
        }
        ${
          record.url
            ? `<a class="notice-link" href="${escapeHtml(record.url)}"
          target="_blank" rel="noopener noreferrer">${isActivity(record) ? 'Åbn link' : 'Åbn jobopslag'}</a>`
            : ''
        }
        ${
          !needsAction && !canFinishActivity && !hasMessage
            ? `<button class="notice-direct"
          data-edit-notice="${escapeHtml(record.id)}">Rediger post</button>`
            : ''
        }
      </section>`;
  }

  function paint() {
    const records = ids.map(get).filter(Boolean),
      followups = records.filter(
        (record) =>
          !messages.has(record.id) && ['due', 'needs-date'].includes(followupState(record)),
      );
    items.innerHTML = `
      ${renderBatchForm(followups)}
      <div id="notice-inline-result" role="status" aria-live="polite"></div>
      ${records.map((record) => renderNoticeRow(record, followups.length)).join('')}
    `;
    items.querySelectorAll('[data-select-id]').forEach((box) =>
      box.addEventListener('change', () => {
        if (box.checked) selected.add(box.dataset.selectId);
        else selected.delete(box.dataset.selectId);
      }),
    );
    items.querySelector('#notice-batch-date')?.addEventListener('input', (e) => {
      batchDate = e.target.value;
    });
    items.querySelector('.notice-batch')?.addEventListener('submit', (event) => {
      event.preventDefault();
      try {
        const targets = followups.filter((record) => selected.has(record.id));
        if (!targets.length) throw Error('Vælg mindst én post.');
        const date = items.querySelector('#notice-batch-date').value;
        const changes = targets.map((record) => scheduleFollowup(record, date));
        if (commit(changes)) {
          for (const record of targets) {
            messages.set(record.id, `Opfølgning gemt til ${formatDate(date)}.`);
            selected.delete(record.id);
          }
          paint();
          toast(`${targets.length} opfølgninger er gemt.`);
        }
      } catch (error) {
        showError(error.message);
      }
    });
    items.querySelectorAll('[data-schedule-id]').forEach((form) =>
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        try {
          const record = get(form.dataset.scheduleId);
          if (!record) throw Error('Posten findes ikke længere.');
          const date = form.elements.date.value;
          if (commit([scheduleFollowup(record, date)])) {
            messages.set(record.id, `Opfølgning gemt til ${formatDate(date)}.`);
            selected.delete(record.id);
            paint();
          }
        } catch (error) {
          showError(error.message);
        }
      }),
    );
    items.querySelectorAll('[data-done-id]').forEach((button) =>
      button.addEventListener('click', () => {
        try {
          const record = get(button.dataset.doneId);
          if (!record) throw Error('Posten findes ikke længere.');
          if (commit([finishFollowup(record)])) {
            messages.set(record.id, 'Markeret som fulgt op.');
            selected.delete(record.id);
            paint();
          }
        } catch (error) {
          showError(error.message);
        }
      }),
    );
    items.querySelectorAll('[data-activity-done]').forEach((button) =>
      button.addEventListener('click', () => {
        const record = get(button.dataset.activityDone);
        if (record && commit([{ ...record, status: 'done' }])) {
          messages.set(record.id, 'Aktiviteten er markeret som gennemført.');
          paint();
        }
      }),
    );
    items.querySelectorAll('[data-edit-notice]').forEach((button) =>
      button.addEventListener('click', () => {
        dialog.close();
        edit(button.dataset.editNotice);
      }),
    );
  }
  function showError(message) {
    items.querySelector('#notice-inline-result').textContent = message;
  }
  return {
    show(list) {
      if (!list.length || document.querySelector('dialog[open]')) return false;
      ids = [...new Set(list.map((x) => x.job.id))];
      selected = new Set(
        ids.filter((id) => ['due', 'needs-date'].includes(followupState(get(id)))),
      );
      messages = new Map();
      batchDate = '';
      paint();
      dialog.showModal();
      return true;
    },
  };
}
