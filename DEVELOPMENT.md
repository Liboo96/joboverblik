# Udviklervejledning

Dette repository er den offentlige demo af Mit joboverblik. Den personlige app ligger i et andet lokalt projekt. Demoen bruger fiktive data og må ikke kobles til private joboplysninger som led i almindelig vedligeholdelse.

## Kom hurtigt i gang

Brug Node.js 20 eller nyere. Python 3 bruges kun til den lokale webserver.

```sh
npm ci
npm test
npm run build
npm run check
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

Åbn http://127.0.0.1:8765. Brug en særskilt browserfane til afprøvning. Der er ingen serverkode, database eller produktionsnøgler at konfigurere.

## Hvor skal jeg rette noget?

Rediger kun appfiler i `src/`. Kør derefter `npm run build`. Det kopierer kildefilerne til `docs/`, som GitHub Pages udgiver. Undlad at rette `docs/` manuelt. `npm run check` opdager forskelle mellem kildekode og udgivelsesfiler. Den tidligere `dist/`-mappe er erstattet af `src/`.

| Fil                       | Ansvar                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `src/index.html`          | Sidens struktur, formular og faste element-id'er                                      |
| `src/style.css`           | Udseende, mobilregler og dialoger                                                     |
| `src/app.js`              | Appens tilstand, lagring, formularhandlinger og opdatering af siden                   |
| `src/logic.mjs`           | Datoer, statusser, validering og regler for påmindelser. Ingen DOM eller browserlager |
| `src/visible-records.mjs` | Filtrering og sortering uden at ændre de oprindelige poster                           |
| `src/record-card.js`      | HTML for ét job- eller aktivitetskort                                                 |
| `src/dom.js`              | Escaping af tekst, der indsættes i HTML                                               |
| `src/navigation.js`       | Desktop- og mobilnavigation samt Mere-dialogen                                        |
| `src/followup.js`         | Dialog til planlægning og gennemførelse af opfølgning                                 |
| `src/notices.js`          | Påmindelser og handlinger for enkelte eller flere poster                              |
| `src/demo.js`             | Demotekst, prøveguide, feedbacklink og dataforklaring                                 |
| `src/sample.mjs`          | Fiktive poster med datoer relativt til i dag                                          |
| `scripts/`                | Lokal formatering, kontrol og generering af udgivelsesfiler                           |
| `tests.mjs`               | Automatiserede tests uden netværk eller browser                                       |

## Sådan hænger appen sammen

`index.html` indlæser `app.js` som et JavaScript-modul. Appen læser fiktive poster eller tidligere demoændringer fra sessionStorage. Den opretter dialoger og navigation og kalder derefter `render()`.

Formularer og dialoger laver nye poster eller kopier af eksisterende poster. De gemmer gennem `save()`. Først når browserlageret accepterer ændringen, opdateres listen i hukommelsen. En ny render-pass opdaterer oversigt, liste og den aktive navigation.

Mobilnavigationen beder de eksisterende desktopknapper om at skifte visning. Appen udsender `viewchange` med visningens navn efter render. Navigationen lytter på den begivenhed. Derfor følger mobilmenuen også med, når en genvej på siden åbner opfølgning.

DOM-eventhandlers for jobkort bindes på ny efter listen er erstattet. Flyt ikke denne binding før HTML-opdateringen. Initialisering af dialoger og navigation sker derimod kun én gang.

## Data og regler, der skal bevares

- `joboverblik.demo.v1` og `joboverblik.demo.seen.v1` er demoens eksisterende sessionStorage-nøgler. Ændr dem ikke uden en plan for eksisterende faner.
- En post har et stabilt `id`, `kind`, titel, virksomhed, status, datoer, noter og et valgfrit HTTP(S)-link. Aktiviteter bruger `activityDate`; ansøgninger bruger `deadline`.
- Datoer gemmes som `YYYY-MM-DD`. Konverter ikke til lokaliserede datotekster i lageret.
- En afsluttet post udløser ingen påmindelser. Planlagt opfølgning og registreret gennemførelse må ikke overskrive ansøgningens status eller noter.
- `validJob` kontrollerer læste og gemte poster. `escapeHtml` beskytter brugerindtastet tekst i HTML-skabeloner. Begge dele skal bevares.
- Feedback åbner en offentlig Google Forms-formular. Appen sender ikke stillinger eller noter med. Der skal ikke tilføjes en API-nøgle i browserkoden.

## Arbejdsgang før udgivelse

1. Ret koden i `src/`. Brug konkrete navne og små funktioner. Kommentarer skal især forklare begrundelser og kontrakter.
2. Kør `npm run format`, `npm test`, `npm run build`, `npm run check` og `npm run format:check`.
3. Afprøv oprettelse, redigering, opfølgning, påmindelser, nulstilling, feedbacklink og navigation i browseren.
4. Kontroller mobil ved 320 og 375 pixels samt desktop. Fysisk telefon og skærmtastatur skal også prøves, når det er muligt.
5. Commit både ændret kildekode og de genererede `docs/`-filer. Push til `main` udløser GitHub Pages. Bekræft, at udgivelsen er færdig.

Ved ændringer af modulafhængigheder eller styling skal `?v=demo-10`-cachemarkøren opdateres konsekvent i HTML og modulimporter, så besøgende ikke får en blanding af gamle og nye filer.

## Kendte grænser

Dette er en lille vanilla JavaScript-demo. `app.js` er fortsat appens koordinator; projektet kræver ikke et framework. CSS har flere responsive override-blokke fra udviklingen. De er nu læsbart formateret, men rækkefølgen påvirker layoutet. Saml dem kun med visuel kontrol af alle skærmstørrelser.

Automatiske tests og syntaxcheck kan ikke bevise korrekt layout eller tilgængelighed. Undgå at kalde løsningen fuldt sikkerhedstestet eller generelt brugervalideret. Fejlbeskeder ved beskadiget browserlager er fortsat fra den oprindelige prototype; en særskilt forbedring bør tilføje en tydelig gendannelsesvej i demoen.
