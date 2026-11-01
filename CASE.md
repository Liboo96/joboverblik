# Mit joboverblik

Et personligt projekt af Liban Farah. Udviklet med AI som værktøj.

[Prøv demoen](https://liboo96.github.io/joboverblik/) · [Se koden](https://github.com/Liboo96/joboverblik)

## Et behov fra min egen jobsøgning

Jeg manglede et samlet sted til at holde styr på stillinger, ansøgningsfrister og opfølgning. Jeg ville kunne se, hvor langt jeg var med en ansøgning, gemme mine noter og vælge mit næste skridt.

Det blev udgangspunktet for Mit joboverblik. Målet med første version er at løse et konkret behov i min hverdag og få en løsning, som andre kan afprøve.

## Fra behov til en lille løsning

Appen samler stillinger med virksomhed, status, frist, link og noter. Jeg kan planlægge opfølgning og registrere, når den er gennemført. Jobmesser og andre aktiviteter har deres egen type, så de ikke tæller som ansøgninger.

Jeg valgte at holde første version enkel. Min personlige udgave gemmer oplysninger i browseren og har mulighed for sikkerhedskopi. Den offentlige demo bruger fiktive oplysninger og gemmer ændringer i den enkelte browserfane. Besøgende får dermed et indblik i funktionerne uden adgang til mine egne joboplysninger.

## Min rolle og brugen af AI

Jeg definerede behovet, prioriterede funktionerne og gav feedback på løsningen undervejs. Jeg valgte blandt andet at fokusere på egen brug og en enkel demo frem for at færdiggøre konti til flere brugere.

Codex har været brugt til løsningsforslag, kode, fejlretning og automatiserede tests. Den tekniske browserkontrol er også gennemført med Codex. Jeg har løbende vurderet den viste løsning og bedt om konkrete ændringer. Projektet er AI-assisteret udvikling. Appen har ikke en indbygget AI-model.

## Tre konkrete forbedringer

**Opfølgning tættere på opgaven.** En dato kan vælges direkte fra påmindelserne. En opfølgning kan også markeres som gennemført uden først at åbne hele stillingen.

**En mobilmenu, der blev ændret efter afprøvning.** Vi afprøvede en foldbar menu, en rullemenu og en bundmenu. Jeg foretrak de synlige valg øverst. Mobilen har nu Overblik, Opfølgning og Aktiviteter samt Mere med de øvrige visninger. Det er et designvalg ud fra min feedback. Det er endnu ikke dokumenteret som den bedste løsning for andre brugere.

**Feedback, der faktisk når frem.** Den første knap kopierede kun tekst. Den nuværende åbner en Google Forms-formular, som kan besvares uden login og uden at oplyse navn eller e-mail. Svarene er private for mig. En markeret testbesvarelse blev indsendt, og mailnotifikationen blev bekræftet modtaget.

## Hvad er kontrolleret?

Status den 29. oktober 2026.

- Demoens syv automatiserede tests består. De omfatter eksempeldata, nulstilling, adskillelse fra den personlige app, modulafhængigheder, filtrering og escaping af tekst i jobkort.
- Den personlige apps 34 tests bestod ved den seneste kontrol i denne udviklingsrunde.
- Demoens layout er kontrolleret i browser ved 320 og 375 pixels bredde samt på desktop.
- Oprettelse, opfølgning og mobilnavigation er afprøvet i browser under udviklingen.
- Demoen er udgivet på GitHub Pages og kan åbnes uden login.

Browserkontrol ved mobilbredde er ikke det samme som test på forskellige fysiske telefoner. Der er endnu ikke gennemført en systematisk test med eksterne brugere eller målt tidsbesparelser.

## Hvad vil jeg undersøge nu?

Jeg vil bruge min personlige udgave i hverdagen og lade 2–3 personer afprøve demoen uden vejledning. Jeg vil især se, om de kan oprette en stilling, ændre status og planlægge opfølgning. De konkrete problemer skal være grundlaget for næste forbedring.

For mig forbinder projektet min ITKO-baggrund med et praktisk forløb fra behov og prioritering til en afprøvbar løsning. Det giver mig konkrete beslutninger og resultater at tale ud fra, samtidig med at jeg er tydelig om, hvad AI har bidraget med, og hvad der fortsat mangler at blive undersøgt.
