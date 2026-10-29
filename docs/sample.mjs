import{localDay}from'./logic.mjs?v=demo-1';
export function createDemoRecords(now=new Date()){
 const day=offset=>{const d=new Date(now);d.setDate(d.getDate()+offset);return localDay(d)};
 const base={kind:'job',url:'',notes:'Fiktive oplysninger til afprøvning.',followup:'',createdAt:now.toISOString()};
 return[
  {...base,id:'demo-office',title:'Administrativ medarbejder',company:'Eksempel Kontor',status:'sent',deadline:day(-3),notes:'Ansøgningen er sendt. Hvornår vil du tjekke efter svar?'},
  {...base,id:'demo-it',title:'IT-koordinator',company:'Fiktiv Kommune',status:'sent',deadline:day(-1),notes:'Prøv at give denne og den anden ansøgning samme opfølgningsdato.'},
  {...base,id:'demo-draft',title:'Projektmedarbejder',company:'Eksempel Organisation',status:'draft',deadline:day(2),notes:'Der er stadig tid til at gøre ansøgningen færdig.'},
  {...base,id:'demo-fair',kind:'activity',title:'Jobmesse',company:'Eksempel Messe',status:'planned',deadline:'',activityDate:day(0),notes:'En aktivitet tælles særskilt fra dine ansøgninger.'},
  {...base,id:'demo-waiting',title:'Kundeservicemedarbejder',company:'Eksempel Service',status:'sent',deadline:day(8),notes:'Afventer ansøgningsfristen.'}
 ];
}
