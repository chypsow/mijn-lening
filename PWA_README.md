PWA Test & Install — Mijn Lening

Kort: zo test je de PWA lokaal en hoe gebruikers de app op hun telefoon kunnen toevoegen.

1) Lokale server (Service Worker werkt op `localhost` zonder HTTPS)

- Met Node (aanbevolen):
```
npx http-server -c-1
```
- Met Python 3:
```
python -m http.server 8000
```
Open in browser: `http://localhost:8080` (of `:8000`).

2) Controleer manifest en service worker

- Open DevTools → Application (Chrome):
  - Manifest: controleer `name`, `start_url`, `icons`, `display`.
  - Service Workers: moet geregistreerd zijn en `sw.js` actief.
  - Cache Storage: zie welke assets in cache zitten.

3) Add to Home Screen

- Android (Chrome): Menu → "Add to Home screen". De app opent standalone.
- iOS (Safari): Deelknop → "Zet op beginscherm". Let op: iOS heeft beperktere PWA-support (soms beleidsverschillen, beperkte background SW).
 
8) PNG icons genereren (optioneel, lokaal)

Als je PNG-bestanden wilt (aanbevolen voor compatibiliteit), kun je lokaal de SVG's converteren met `sharp`:

```bash
# 1) Installeer dependencies
npm install

# 2) Genereer PNG's (192 & 512)
npm run build-icons
```

De output wordt geschreven naar `images/icons/icon-192.png` en `images/icons/icon-512.png`. `manifest.json` bevat nu PNG-entries en SVG-fallbacks.

4) HTTPS and production

- Voor publicatie gebruik altijd HTTPS (Let’s Encrypt of hosting met HTTPS).
- Browsers vereisen HTTPS voor service workers en veel PW-functies.

5) Icons & splash

- Zorg dat `manifest.json` verwijst naar 192×192 en 512×512 icons.
- iOS negeert `manifest.json` icons; voeg geschikte icons handmatig in Xcode of gebruik meta-tags voor Apple touch icons.

6) Debugging tips

- SW niet registreren? Controleer console voor fouten en `network` tab voor 404.
- Cache probleem? In DevTools → Application → Service Workers → Unregister en caches deleten.
- Force reload bypass cache: Ctrl+F5 / Cmd+Shift+R.

7) Verdere stappen (optioneel)

- Verbeter SW caching strategie (runtime caching voor API, precache voor app shell).
- Voeg screenshots & short_name in `manifest.json` aan.
- Test op echte apparaten (iOS en Android) en controleer standalone weergave en oriëntatie.

Als je wilt, kan ik:
- Icons als PNG exporteren vanaf de SVG's (192/512) en toevoegen.
- Een verbeterde SW template maken (runtime cache + stale-while-revalidate) en uitleggen hoe updates werken.
