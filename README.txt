PILOT ACADEMY – PROTOTYP V1

Enthalten: 9 PPL-Themenübersichten, 4 Einsteigerlektionen auf Deutsch und Polnisch, 6 selbst erstellte Übungsfragen, Sprachausgabe (abhängig von iOS-Stimmen), lokaler Lernfortschritt, App-Manifest, Offline-Service-Worker.

WICHTIG: Die Dateien allein sind noch keine öffentlich installierte App. Zur Installation als iPhone-Web-App die Dateien unverändert auf eine HTTPS-Webadresse stellen (z.B. GitHub Pages, Netlify oder eigener Webspace), in Safari öffnen, Teilen > Zum Home-Bildschirm > Hinzufügen. Nach dem ersten vollständigen Laden kann die App offline verwendet werden. Die Verfügbarkeit der Sprachausgabe offline hängt von den auf dem Gerät installierten Stimmen ab. Offline-Spracherkennung, freier KI-Fluglehrer, vollständiger Prüfungskatalog und geräteübergreifende Synchronisation sind NICHT in dieser ersten Version enthalten.

Lokale Vorschau: index.html am Computer in Browser öffnen. Service Worker/offline-Installation funktionieren nur mit HTTPS oder localhost, nicht als file://.

Dies ist kein offizielles Schulungsprogramm; weiterführende Inhalte müssen fachlich geprüft werden. Keine Verwendung zur realen Flugnavigation.

PHASE 1 – LOKALER ENTWICKLUNGSSTAND

Struktur:
- index.html und styles.css: statisches Grundgerüst und Gestaltung.
- src/content.js: alle neun Fächer, vier Lektionen und sechs Fragen mit stabilen IDs.
- src/i18n.js: vollständige deutsche und polnische Oberflächentexte.
- src/ui.js: Darstellung, ohne Speicherzugriffe oder globale Ereignisfunktionen.
- src/app.js: Navigation, Sprachwechsel, Audio und Koordination der Anwendung.
- src/quiz.js: Antwortmischung und Bewertung über Antwort-IDs.
- src/storage.js: validierter, versionierter Fortschritt mit Übernahme des alten Formats.
- src/modules.js: vorbereitete Modulübersicht für Lehrbuch, Ausbildungsprofil,
  Flugzeugdatenbank und virtuellen Fluglehrer. Die drei späteren Module sind noch
  nicht implementiert und werden nicht als verfügbare Funktionen angezeigt.
- sw.js: vollständiger Cache der neuen Dateistruktur. Updates warten, bis die
  bisherige App geschlossen ist; Fortschrittsdaten werden dabei nicht gelöscht.

Keine Build-Werkzeuge und keine Laufzeitbibliotheken erforderlich. Alle Pfade sind
relativ und für GitHub Pages unter /pilot-academy/ geeignet. Wegen ES-Modulen bitte
auch die lokale Vorschau über HTTP öffnen, nicht über file://:
  python3 -m http.server 8000
  Danach http://localhost:8000/ öffnen.

Tests (Node.js ab Version 22):
  npm test
Die Kernprüfungen benötigen keine zusätzlichen Pakete.
Browserprüfung mit separat installiertem Playwright und Browser:
  node tests/browser.cjs
Optional: PILOT_CHROMIUM_PATH für einen vorhandenen Chromium-Browser,
PILOT_TEST_URL für die Vorschauadresse (auch mit Unterpfad),
PILOT_TEST_WEBKIT=1 für einen zusätzlich installierten WebKit-Testbrowser.

Speicherverhalten: Der bisherige Schlüssel pilot-academy-state bleibt erhalten.
Alte Kapitelnummern werden in stabile IDs umgewandelt. Beschädigte Daten führen zu
sicheren Standardwerten und einer sichtbaren Meldung. Bei blockiertem Speicher
bleibt die App für die Sitzung nutzbar. Daten aus einer unbekannten neueren Version
werden nicht überschrieben. Der Löschknopf setzt den Fortschritt nach Rückfrage zurück.
Die Antwortreihenfolge bleibt innerhalb einer laufenden Frage auch bei Sprach- oder
Ansichtswechsel erhalten. Angefangene Quizsitzungen werden noch nicht über einen
App-Neustart hinweg gespeichert; Gesamtstatistik und gelesene Kapitel schon.

Noch offen: echter Safari-/iPhone-Test einschließlich installierter Web-App,
Offline-Stimmen, fachliche Prüfung der Übersetzungen sowie spätere Inhalts- und
Funktionsphasen. Offline-Dateien können vom Betriebssystem entfernt werden.

AUSBILDUNGSVARIANTEN
Deutschland (DE) ist die Standardvariante; Polen (PL) kann in den Einstellungen
unabhängig von Deutsch/Polnisch als Oberflächensprache gewählt werden. Die Auswahl
bleibt im lokalen Fortschritt erhalten. Bestehende Lektionen und Fragen sind als
gemeinsame EASA-Grundlagen gekennzeichnet. src/training.js trennt davon nationale
Inhalte und Prüfungsregeln je Land. Diese Bereiche sind bewusst noch leer bzw.
nicht freigegeben: Nationale Rechtsquellen, Zuständigkeiten und Prüfungsdetails
müssen vor der fachlichen Integration für Deutschland und Polen geprüft werden.
Die aktuelle Quizfunktion ist weiterhin ein Lerntraining ohne nationale Prüfungsregeln.

PHASE 1.1 – START, OFFLINE-FEHLER UND SICHERE RELEASE-VORBEREITUNG

Die index.html enthält jetzt eine eigenständig sichtbare, zweisprachige Start- und
Fehleranzeige. Sie benötigt weder das CSS noch erfolgreiche App-Modulimporte.
Ein erneuter Ladeversuch löscht keinen Fortschritt. Selbst bei einem defekten
Modulgraphen kann die Startseite ein Update eines vorhandenen Service Workers
finden und zum vollständigen Schließen und erneuten Öffnen auffordern.

src/offline.js überwacht Registrierung, Installation, Aktivierung und Zeitüberschreitung.
Offline-Fehler werden mit einer Wiederholungsschaltfläche angezeigt. In den
Einstellungen können Offline-Dateien und Updates erneut geprüft werden. Es wird
kein Service Worker zwangsweise aktiviert oder deregistriert. Ein vollständig
heruntergeladenes Update wartet auf das Schließen aller bisherigen App-Ansichten.
Die Meldung erklärt dies in der gewählten Sprache und warnt vor dem Löschen der
Website-Daten. Hintergrundmeldungen ersetzen die Lernansicht nicht und ändern
deren Fokus nicht.

Fokus: Nach Navigation wird die Seitenüberschrift fokussiert, nach einer Antwort
die Auswertung, nach der nächsten Frage die neue Frage. Sprach- und Länderwahl
behalten den Fokus auf der entsprechenden Schaltfläche. VoiceOver auf einem
echten iPhone muss zusätzlich manuell geprüft werden.

Release-Vorbereitung (nur lokal, keine Veröffentlichung durch diese Befehle):
1. Versionsnummer in release.json erhöhen; eine veröffentlichte Versionsnummer
   nicht für andere Inhalte erneut verwenden.
2. npm run prepare:release
3. npm test
4. npm run check:release
5. npm run test:browser (Playwright und Chromium müssen separat vorhanden sein).
   Optional PILOT_CHROMIUM_PATH=/usr/bin/chromium verwenden.

prepare:release vereinheitlicht Versionsparameter in Modul-/CSS-URLs und erzeugt
release-manifest.js. Die Cache-ID besteht aus der semantischen Version und einem
Fingerprint der Asset-Prüfsummen sowie des Service-Worker-Codes. check:release
prüft die erzeugten Dateien ohne Änderung. Nach jeder Änderung an App-Dateien
muss das Manifest erneut erzeugt werden. Alle Dateien gehören gemeinsam zu einem
Release. GitHub Pages benötigt weiterhin keinen Laufzeitserver oder Build-Schritt,
wenn die lokal erzeugten Release-Dateien bereits vollständig vorliegen.

Der Worker lädt alle Assets mit Umgehung des HTTP-Caches und prüft SHA-256, bevor
er den Release-Cache befüllt. Eine fehlende oder abweichende Datei verhindert die
neue Installation; ein älterer aktiver Release-Cache bleibt dabei erhalten.
Nach Aktivierung werden nur zu dieser App/Installation gehörende Alt-Caches
entfernt. Fehlende aktive Cache-Dateien werden nur durch passende Bytes ersetzt.
Prüfsummen sind eine Konsistenzprüfung und keine Signatur gegen eine manipulierte
Website. Beim erstmaligen Online-Laden ist ein gemeinsam bereitgestellter
Dateistand weiterhin erforderlich; ein Fehler zeigt die Start-/Offline-Meldung.

Installationssprache: manifest.webmanifest (Deutsch) bleibt die Standarddatei.
manifest.pl.webmanifest ergänzt polnische Beschreibung und Sprachkennung. ID,
Startadresse, Scope, Icons und App-Name bleiben identisch. Der Sprachwechsel passt
die Manifest-Verknüpfung und die HTML-Beschreibung an. Der neutrale App-Name bleibt
Pilot Academy. iOS kann Installationsinformationen übernehmen, unverändert lassen
oder erst bei einer späteren Installation neu auswerten; eine nachträgliche
Umbenennung einer installierten App wird nicht versprochen. Nicht zum Sprachwechsel
neu installieren oder Website-Daten löschen.

Die Fortschrittsspeicherung behält denselben Schlüssel und dasselbe Version-1-
Format wie Phase 1.0. Die Migration der ursprünglichen Kapitelnummern bleibt
bestehen. Cache-Reparatur und Worker-Update verändern keine Lernfortschrittsdaten.
Origin und App-Adresse müssen für ein bestehendes Gerät beibehalten werden.

VERSION 1.1.1 – SAFARI-NAVIGATION UND WIEDERHERSTELLUNG

Ursache des Fehlers in 1.1: Einige Hosts leiten /index.html auf / weiter. Der
alte Worker folgte der Weiterleitung, speicherte die Response einschließlich
Redirect-Historie und gab sie später für Navigationen zurück. Gleiche HTML-Bytes
bedeuteten deshalb trotz richtiger Prüfsumme keine geeignete Navigationsantwort.

1.1.1 lädt HTML nur über kanonische Verzeichnisadressen: ./ und ./recovery/.
Die physischen Dateien index.html und recovery/index.html bleiben im Uploadpaket,
werden aber nicht über ihre möglicherweise weitergeleiteten Dateiadressen
vorabgerufen. Der Generator ordnet die jeweilige HTML-Prüfsumme der kanonischen
Adresse zu. Die App-Startadresse bleibt ./; bei Cloudflare ist dies /, auf GitHub
Pages /pilot-academy/.

Release-Downloads verwenden redirect:error. Status, endgültige Adresse, MIME-Typ
für HTML und SHA-256 werden geprüft. Weitergeleitete oder beschädigte gespeicherte
Antworten gelten nicht als offline bereit. HTML-Navigationsantworten werden aus
geprüften Bytes neu erzeugt; Transport-Encoding/-Länge und Location werden dabei
entfernt. Bei Cache-Problemen ist nur eine verifizierte Reparatur erlaubt. Kann
sie offline nicht gelingen, erscheint eine zweisprachige Fehlerseite mit Link
zur Wiederherstellung statt einer ungeeigneten Redirect-Response.

Wiederherstellung:
- Cloudflare-Root: https://DEIN-HOST/recovery/
- GitHub-Pages-Unterpfad: https://DEIN-HOST/pilot-academy/recovery/
- recovery/index.html ist eigenständig: Inline-CSS und Inline-JavaScript, keine
  Abhängigkeit von App-Modulen. Sprache ist bewusst zweisprachig.
- Sicherung liest ausschließlich pilot-academy-state und bietet die unveränderte
  Zeichenfolge einschließlich Quelle und Zeitpunkt als JSON-Download an. Dieser
  Download ist eine Sicherung; eine automatische Importfunktion gibt es noch nicht.
- Updateprüfung registriert/aktualisiert sw.js an der bisherigen App-Basis.
  Es gibt kein unregister(), kein skipWaiting() und kein Löschen des Fortschritts.
- Bei wartendem Update alle App-Ansichten einschließlich recovery/ schließen und
  dann erneut öffnen. Nicht Website-Daten löschen oder die App entfernen.
- Der fehlerhafte Worker aus 1.1 behandelt recovery/ als unbekannte Adresse und
  kann sie online vom Server laden. Dies ist lokal für beide Basispfade geprüft.
- Grenzen: Ist recovery/ noch nicht bereitgestellt, offline nicht vorhanden,
  vom Server umgeleitet/blockiert oder von einem anderen alten Worker abgefangen,
  kann diese Seite das nicht garantiert umgehen. Neue HTML-Downloads müssen unter
  den kanonischen Adressen unmittelbar Status 200 liefern. Kein alternativer Host:
  Ein anderer Origin könnte auf den bestehenden Fortschritt nicht zugreifen.
- Ein bereits offener alter Tab kann die Aktivierung weiterhin verhindern.
- iOS kann Downloads anders darstellen. Das Speichern der Sicherung in Dateien
  sowie Safari, installierte Web-App und VoiceOver müssen auf dem Gerät geprüft werden.

Zusätzliche Regressionstests:
  npm run test:redirects
Sie simulieren 301/302/307/308 unter / und /pilot-academy/, Neustarts, Query- und
index.html-Aliasse, Offline-Betrieb, bewusst injizierte Redirect-Cache-Einträge,
Ablehnung weitergeleiteter kanonischer Assets, Grenzen einer fehlenden recovery/
sowie den Wechsel des fehlerhaften Commits 85c1744 auf 1.1.1 mit unverändertem
Fortschritt. Alle Browserprofile und Testdaten sind isolierte temporäre Fixtures.
Es werden keine Browserdaten eines echten Geräts oder Nutzerkontos gelöscht.

Für ein künftiges Uploadpaket zusätzlich recovery/index.html einbeziehen. Runtime-
Dateien, release-manifest.js und Release-Version müssen gemeinsam bereitgestellt
werden. Eine Bereitstellung oder ein ZIP-Upload erfolgt nicht durch diese Tests.
