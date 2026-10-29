# Mit joboverblik

En lille dansk webapp til overblik over jobsøgningen. Projektet udspringer af mit eget behov for at samle stillinger, frister, noter og opfølgning ét sted.

## Prøv løsningen

Dette repository indeholder en separat demo med fiktive oplysninger. Du kan tilføje en stilling, ændre status, planlægge opfølgning og registrere en aktivitet. Start forfra nulstiller prøveoplysningerne. Åbn demoen på https://Liboo96.github.io/joboverblik/ .

[Læs projektcasen med behov, arbejdsdeling med AI og afprøvning](CASE.md)

## Projektets fokus

Jeg er uddannet cand.it. i IT, Kommunikation og Organisation. Med projektet vil jeg vise arbejdet fra et konkret behov til en afgrænset løsning, der kan afprøves.

AI er brugt som udviklingsværktøj til kode, løsningsforslag og tests. Mit bidrag er det personlige behov, prioritering af funktioner og feedback under udviklingen. Koden er AI-assisteret; appen kalder ikke selv en AI-model.

Konkrete valg undervejs:

- Aktiviteter har deres egen type og tæller ikke som ansøgninger.
- Opfølgning kan planlægges og markeres som gennemført direkte i påmindelserne.
- Arbejdsgiverdemoen bruger fiktive data og er adskilt fra mit personlige overblik.

## Teknik og begrænsninger

HTML, CSS og JavaScript-moduler uden et frontend-framework. Demoen bruger sessionStorage i den aktuelle fane. Den har ingen login, database eller automatisk synkronisering. Brug fiktive oplysninger. Påmindelser vises, når siden er åben. Feedbackknappen åbner Google Forms i en ny fane. Alle kan svare uden login. Der indsamles ikke navn eller e-mail i formularen. Kun indsendte feedbacksvar overføres; demoens stillinger og noter indgår ikke. Svarene er private for formularejeren, som har aktiveret mailnotifikationer.

## Kør og kontroller

Kræver Node.js til tests og Python 3 til nedenstående lokale server:

```sh
npm test
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Åbn http://127.0.0.1:8765. Testene kontrollerer eksempeldata, nulstilling, adskillelse fra den private app og lokale modulafhængigheder. De erstatter ikke en visuel browserkontrol.

## Udgivelse

GitHub Pages udgiver `docs/` fra main-branchen. Mappen er en kopi af demoens `dist/`. Kør `npm test` før opdatering og hold de to mapper ens. Repositoryet indeholder demoen, ikke den personlige app eller udviklingsudgaverne med konti.

## Mulig videreudvikling

Først afprøvning i egen hverdag og forbedringer ud fra konkrete problemer. Login og synkronisering kan undersøges senere.
