const feedbackUrl='https://docs.google.com/forms/d/e/1FAIpQLSfqRddX0xlWpuD-YKOi-6N9-KLvevSfDYpiSvAIV0T-4rlp7Q/viewform';
function openFeedback(){window.open(feedbackUrl,'_blank','noopener,noreferrer');}
export function initDemo({reset,showReminders,addRecord,changeStatus,planFollowup}){
 const sidebar=document.querySelector('aside');
 const menu=document.createElement('nav');menu.id='demo-menu';menu.className='demo-menu';menu.setAttribute('aria-label','Visninger');
 sidebar.querySelectorAll('.nav').forEach(button=>menu.append(button));
 sidebar.querySelector('.side-label').after(menu);
 const bottom=document.createElement('nav');bottom.className='bottom-nav';bottom.setAttribute('aria-label','Mobilnavigation');bottom.innerHTML='<button type="button" data-mobile-view="all">Overblik</button><button type="button" data-mobile-view="followup">Opfølgning</button><button type="button" data-mobile-view="activities">Aktiviteter</button><button type="button" id="mobile-more" aria-haspopup="dialog" aria-controls="more-views" aria-expanded="false">Mere</button>';
 document.body.append(bottom);
 const more=document.createElement('dialog');more.id='more-views';more.setAttribute('aria-labelledby','more-title');more.innerHTML='<div class="more-inner"><div class="more-heading"><h2 id="more-title">Flere visninger</h2><button type="button" id="more-close">Luk</button></div><button type="button" data-mobile-view="action">Kræver handling</button><button type="button" data-mobile-view="closed">Afsluttede</button></div>';
 document.body.append(more);
 const moreButton=bottom.querySelector('#mobile-more');
 const syncNavigation=view=>{document.querySelectorAll('[data-mobile-view]').forEach(button=>{const active=button.dataset.mobileView===view;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});const secondary=['action','closed'].includes(view);moreButton.classList.toggle('active',secondary);if(secondary)moreButton.setAttribute('aria-current','page');else moreButton.removeAttribute('aria-current');};
 document.addEventListener('viewchange',event=>syncNavigation(event.detail));syncNavigation('all');
 const chooseView=button=>{if(more.open)more.close();const target=[...menu.querySelectorAll('.nav')].find(item=>item.dataset.view===button.dataset.mobileView);target?.click();document.querySelector('.workspace').scrollIntoView({block:'start'});};
 bottom.querySelectorAll('[data-mobile-view]').forEach(button=>button.addEventListener('click',()=>chooseView(button)));
 more.querySelectorAll('[data-mobile-view]').forEach(button=>button.addEventListener('click',()=>chooseView(button)));
 moreButton.addEventListener('click',()=>{moreButton.setAttribute('aria-expanded','true');more.showModal();});
 more.querySelector('#more-close').addEventListener('click',()=>more.close());
 more.addEventListener('close',()=>moreButton.setAttribute('aria-expanded','false'));
 more.addEventListener('click',event=>{if(event.target===more){const bounds=more.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)more.close();}});
 matchMedia('(max-width:760px)').addEventListener('change',event=>{if(!event.matches&&more.open)more.close();});
 const banner=document.createElement('section');banner.className='demo-banner';banner.innerHTML='<div><span class="demo-pill">ÅBEN DEMO</span><p>Prøv med fiktive data. Ændringer gemmes kun i denne fane. Brug ikke personlige oplysninger.</p></div><div class="demo-banner-actions"><button id="demo-try">Påmindelser</button><button id="demo-feedback" aria-label="Giv feedback – åbner Google Forms i en ny fane">Giv feedback</button><button id="demo-reset">Start forfra</button></div>';
 document.querySelector('main').prepend(banner);
 const guide=document.createElement('details');guide.className='demo-guide';guide.innerHTML='<summary>Prøv demoen <span>3 små trin</span></summary><ol><li><strong>Tilføj en stilling</strong><p>Brug en fiktiv titel og virksomhed. Tryk Gem.</p><button type="button" id="guide-add">1. Tilføj en stilling</button></li><li><strong>Skift status</strong><p>Åbn en post. Vælg fx Sendt, og gem ændringen.</p><button type="button" id="guide-status">2. Prøv at ændre status</button></li><li><strong>Planlæg opfølgning</strong><p>Vælg en dato for dit næste skridt, og gem den.</p><button type="button" id="guide-followup">3. Vælg opfølgningsdato</button></li></ol><p class="guide-note">Du bestemmer selv rækkefølgen. Start forfra nulstiller prøveoplysningerne.</p>';
 document.querySelector('.intro').after(guide);
 guide.querySelector('#guide-add').addEventListener('click',addRecord);
 guide.querySelector('#guide-status').addEventListener('click',changeStatus);
 guide.querySelector('#guide-followup').addEventListener('click',planFollowup);
 document.querySelector('#demo-try').addEventListener('click',showReminders);
 document.querySelector('#demo-reset').addEventListener('click',()=>{reset()});
 document.querySelector('#demo-feedback').addEventListener('click',openFeedback);
 const about=document.createElement('section');about.className='demo-about';about.innerHTML='<div><h2>Et projekt, der starter i hverdagen</h2><p>Jeg er selv jobsøgende og bygger Mit joboverblik med AI som udviklingsværktøj. Målet er færre klik og bedre styr på ansøgninger, frister og næste skridt.</p><p>Prøv at planlægge opfølgning, give flere ansøgninger samme dato eller markere jobmessen som gennemført.</p></div><div><h3>Hvad kan du prøve her?</h3><p>Denne demo viser overblik, aktiviteter og påmindelser. Du kan prøve alle funktionerne uden login.</p><p>Alle er velkomne til at give feedback. Formularen åbner i en ny fane og kræver ikke login.</p><button id="demo-about-feedback">Giv feedback</button><button id="demo-privacy">Om data i demoen</button></div>';
 document.querySelector('footer').before(about);
 document.querySelector('#demo-about-feedback').addEventListener('click',openFeedback);
 const privacy=document.createElement('dialog');privacy.innerHTML='<div class="notice-inner"><div class="eyebrow">OM DENNE DEMO</div><h2>Dine ændringer bliver i fanen</h2><p>Demoen er til at afprøve funktioner med fiktive oplysninger. Ændringer gemmes i fanens sessionslager og forsvinder, når fanen lukkes. Start forfra nulstiller prøveoplysningerne.</p><p>Demoen har ingen database til joboplysninger og ingen AI-kald. Giv feedback åbner en Google Forms-formular i en ny fane. Kun de svar, du selv indsender i formularen, sendes til Google og bliver tilgængelige for Liban. Dine stillinger og noter i demoen sendes ikke med. Navn og e-mail indsamles ikke i formularen.</p><p>Der er ikke tilføjet analyseværktøjer eller reklametrackere i appkoden. Hostingudbyderen kan behandle tekniske besøgsoplysninger. Dette er en tidlig demo, ikke en færdig tjeneste til rigtige joboplysninger.</p><button id="privacy-close" class="primary">Luk</button></div>';
 document.body.append(privacy);document.querySelector('#demo-privacy').addEventListener('click',()=>privacy.showModal());privacy.querySelector('#privacy-close').addEventListener('click',()=>privacy.close());
}
