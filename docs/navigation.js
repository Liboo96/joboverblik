/** Keep desktop and mobile navigation in sync with app.js's viewchange event.
 * Navigation requests use the existing desktop buttons so both layouts share one state.
 */
export function initNavigation() {
  const sidebar = document.querySelector('aside');
  const menu = document.createElement('nav');
  menu.id = 'demo-menu';
  menu.className = 'demo-menu';
  menu.setAttribute('aria-label', 'Visninger');
  sidebar.querySelectorAll('.nav').forEach((button) => menu.append(button));
  sidebar.querySelector('.side-label').after(menu);
  const mobileNavigation = document.createElement('nav');
  mobileNavigation.className = 'mobile-navigation';
  mobileNavigation.setAttribute('aria-label', 'Mobilnavigation');
  mobileNavigation.innerHTML = `
<button type="button" data-mobile-view="all">Overblik</button
><button type="button" data-mobile-view="followup">Opfølgning</button
><button type="button" data-mobile-view="activities">Aktiviteter</button
><button
  type="button"
  id="mobile-more"
  aria-haspopup="dialog"
  aria-controls="more-views"
  aria-expanded="false"
>
  Mere
</button>
`;
  sidebar.append(mobileNavigation);
  const more = document.createElement('dialog');
  more.id = 'more-views';
  more.setAttribute('aria-labelledby', 'more-title');
  more.innerHTML = `
<div class="more-inner">
  <div class="more-heading">
    <h2 id="more-title">Flere visninger</h2>
    <button type="button" id="more-close">Luk</button>
  </div>
  <button type="button" data-mobile-view="action">Kræver handling</button
  ><button type="button" data-mobile-view="closed">Afsluttede</button>
</div>
`;
  document.body.append(more);
  const moreButton = mobileNavigation.querySelector('#mobile-more');
  const syncNavigation = (view) => {
    document.querySelectorAll('[data-mobile-view]').forEach((button) => {
      const active = button.dataset.mobileView === view;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    const secondary = ['action', 'closed'].includes(view);
    moreButton.classList.toggle('active', secondary);
    if (secondary) moreButton.setAttribute('aria-current', 'page');
    else moreButton.removeAttribute('aria-current');
  };
  document.addEventListener('viewchange', (event) => syncNavigation(event.detail));
  syncNavigation('all');
  const chooseView = (button) => {
    if (more.open) more.close();
    const target = [...menu.querySelectorAll('.nav')].find(
      (item) => item.dataset.view === button.dataset.mobileView,
    );
    target?.click();
    document.querySelector('.workspace').scrollIntoView({ block: 'start' });
  };
  mobileNavigation
    .querySelectorAll('[data-mobile-view]')
    .forEach((button) => button.addEventListener('click', () => chooseView(button)));
  more
    .querySelectorAll('[data-mobile-view]')
    .forEach((button) => button.addEventListener('click', () => chooseView(button)));
  moreButton.addEventListener('click', () => {
    moreButton.setAttribute('aria-expanded', 'true');
    more.showModal();
  });
  more.querySelector('#more-close').addEventListener('click', () => more.close());
  more.addEventListener('close', () => moreButton.setAttribute('aria-expanded', 'false'));
  more.addEventListener('click', (event) => {
    if (event.target === more) {
      const bounds = more.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.mobileNavigation
      )
        more.close();
    }
  });
  matchMedia('(max-width:760px)').addEventListener('change', (event) => {
    if (!event.matches && more.open) more.close();
  });
}
