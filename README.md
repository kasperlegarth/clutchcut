# 🎮 Clutch Cut

Clutch Cut er et værktøj til gaming content creators, der hjælper med at finde de bedste **"clutch moments"** i deres optagede gameplay.  
Målet er at gøre det hurtigt og nemt at udpege highlights, som kan bruges til fx YouTube Shorts, TikTok eller andre sociale medier.

---

## 🚀 MVP – hvad kan Clutch Cut?

I første version (MVP) fokuserer Clutch Cut på **Battlefield 2042** (og senere Battlefield 6, når det udkommer).

Brugerflow:

1. Spilleren optager en runde i Battlefield med OBS (MP4/MKV).
2. Filen vælges i Clutch Cut og analyseres lokalt.
3. Output er en **tabel med hændelser** (fx kills, assists, revives, sprængte køretøjer).
4. Systemet foreslår automatisk **clutch moments** – fx *multikill* eller *kill streaks*.
5. For hvert forslag vises:
   - Titel (fx *Multikill*)
   - Start- og slut-tidsstempel
   - En **preview-knap**, der afspiller klippet direkte i appen.

👉 **Bemærk:** MVP genererer ikke færdige videoklip. Den laver kun analyse, tidskoder og preview.

---

## 🛠 Teknisk

### Krav til MVP
- Kører lokalt på brugerens maskine.
- UI bygget i web-teknologier → pakket som desktop-app.
- Enkel storage (JSON-log med filnavn, hændelser og forslag).
- Ingen cloud, ingen AI-dependens i første omgang.

### Techstack
- **UI:** Vue 3 + shadcn-vue
- **Shell:** Electron (desktop-app)
- **Analyse:**  
  - `ffmpeg/ffprobe` til metadata og frames  
  - OCR (Tesseract) til at læse kill feed (engelsk HUD)  
  - Simple regler til at definere clutch moments
- **Storage:** Lokal JSON-fil

---

## 🔮 Fremtidige muligheder
- Automatisk generering af klip (video-eksport).
- AI til mere avanceret event-detektion.
- Web-interface, så brugere uden kraftig hardware kan analysere i skyen.

---

## 📦 Kom i gang (dev)

Clone repo og installer afhængigheder:

```bash
git clone https://github.com/<your-username>/clutchcut.git
cd clutchcut
npm install
```
Start desktop-app i udviklingstilstand:
```bash
npm run dev
```
Byg appen:
```bash
npm run build
```