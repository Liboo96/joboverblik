import { alerts, followupState, isActivity, localDay, recordDate } from './logic.mjs?v=demo-10';

/** Return a new list. Filtering/sorting must never reorder the stored records. */
export function getVisibleRecords(
  records,
  { view, query = '', status = '', sort = 'deadline', today = localDay() },
) {
  const search = query.toLocaleLowerCase('da');
  const visible = records.filter((record) => {
    let matchesView;
    switch (view) {
      case 'closed':
        matchesView = record.status === 'closed';
        break;
      case 'action':
        matchesView = alerts(record, today).length > 0;
        break;
      case 'activities':
        matchesView = isActivity(record) && record.status !== 'closed';
        break;
      case 'followup':
        matchesView = followupState(record, today) !== 'none';
        break;
      default:
        matchesView = record.status !== 'closed';
    }
    const matchesStatus = !status || record.status === status;
    const searchableText = `${record.title} ${record.company} ${record.notes}`.toLocaleLowerCase(
      'da',
    );
    return matchesView && matchesStatus && (!search || searchableText.includes(search));
  });
  return visible.sort((first, second) => {
    if (sort === 'new') return (second.createdAt || '').localeCompare(first.createdAt || '');
    // Missing dates go last; records with the same date are ordered by company.
    const firstDate = (sort === 'deadline' ? recordDate(first) : first[sort]) || '9999';
    const secondDate = (sort === 'deadline' ? recordDate(second) : second[sort]) || '9999';
    return (
      String(firstDate).localeCompare(String(secondDate)) ||
      first.company.localeCompare(second.company, 'da')
    );
  });
}
