export const jobStatuses={idea:'Overvejer',draft:'Under udarbejdelse',sent:'Sendt',interview:'Samtale',closed:'Afsluttet'};
export const activityStatuses={planned:'Planlagt',done:'Gennemført',closed:'Afsluttet'};
export const statuses={...jobStatuses,...activityStatuses};
export const isActivity=j=>j.kind==='activity';
export const statusesFor=j=>isActivity(j)?activityStatuses:jobStatuses;
export const recordDate=j=>isActivity(j)?j.activityDate:j.deadline;
export const withoutDemo=records=>records.filter(record=>record.demo!==true);
export const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d+'T12:00:00Z'))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
export const localDay=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function daysBetween(a,b){return Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000)}
export const pending=j=>!isActivity(j)&&['idea','draft'].includes(j.status);
export function followupState(j,today=localDay()){
 if(j.status==='closed')return 'none';
 if(j.followup)return j.followup<=today?'due':'planned';
 if(!isActivity(j)&&['sent','interview'].includes(j.status)&&j.deadline&&j.deadline<today&&(!j.lastFollowupAt||j.lastFollowupAt<j.deadline))return 'needs-date';
 return 'none';
}
export const needsFollowup=(j,today=localDay())=>['due','needs-date'].includes(followupState(j,today));
export function scheduleFollowup(j,date){if(j.status==='closed')throw Error('Genåbn posten før du planlægger opfølgning.');if(!validDate(date))throw Error('Vælg en gyldig opfølgningsdato.');return{...j,followup:date};}
export function finishFollowup(j,today=localDay()){if(j.status==='closed')throw Error('Posten er afsluttet.');if(!validDate(today))throw Error('Ugyldig dato.');return{...j,followup:'',lastFollowupAt:today};}
export function alerts(j,today=localDay()){
 if(j.status==='closed')return [];
 const a=[];
 if(isActivity(j)&&j.status==='planned'&&j.activityDate){const d=daysBetween(today,j.activityDate);if(d<=3)a.push({key:`${j.id}:activity:${j.activityDate}`,text:d<0?'Aktivitetsdatoen er passeret. Markér aktiviteten som gennemført, hvis du deltog.':d===0?'Aktiviteten er i dag.':`Aktiviteten er om ${d} ${d===1?'dag':'dage'}.`});}
 if(pending(j)&&j.deadline){const d=daysBetween(today,j.deadline);if(d<=3)a.push({key:`${j.id}:deadline:${j.deadline}`,text:d<0?'Ansøgningsfristen er udløbet. Tjek om du stadig kan søge.':d===0?'Ansøgningsfrist i dag.':`Ansøgningsfrist om ${d} ${d===1?'dag':'dage'}.`});}
 if(followupState(j,today)==='due')a.push({key:`${j.id}:followup:${j.followup}`,text:'Det er tid til din planlagte opfølgning.',action:'followup'});
 if(followupState(j,today)==='needs-date')a.push({key:`${j.id}:passed:${j.deadline}`,text:'Ansøgningsfristen er passeret. Vælg en dato til opfølgning.',action:'followup'});
 return a;
}
export function validJob(j){return j&&[undefined,'job','activity'].includes(j.kind)&&typeof j.id==='string'&&j.id.length<=100&&typeof j.title==='string'&&j.title.trim().length>0&&j.title.length<=160&&typeof j.company==='string'&&j.company.trim().length>0&&j.company.length<=120&&Object.hasOwn(statusesFor(j),j.status)&&['deadline','followup'].every(k=>j[k]===''||validDate(j[k]))&&(j.activityDate===undefined||j.activityDate===''||validDate(j.activityDate))&&(!isActivity(j)||j.deadline==='')&&typeof j.notes==='string'&&j.notes.length<=5000&&typeof j.url==='string'&&j.url.length<=3000&&(!j.url||/^https?:\/\//i.test(j.url));}
