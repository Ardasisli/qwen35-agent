# Çözüm: Web Streaming + Terminal UI Eşitleme

## Sorun Analizi

1. **Web tam streaming yapamıyor** → `web-ui/server.js` içindeki Ollama proxy `http.request` + `pipe` kullanıyordu.
   - `content-length` header'ı korunuyordu → Node tamponluyor, chunk'lar birikiyordu
   - `Transfer-Encoding: chunked` ve `X-Accel-Buffering: no` yoktu → nginx/proxy buffer
   - `res.flush()` çağrılmıyordu → kelime kelime akış yerine toplu geliyordu

2. **Terminalde web'deki gibi UI tasarlanamıyor** → `terminal.js` sadece `readline` + `console.log` kullanıyor.
   - Web'de: panel (model, think, smith, ctx, temp), progress bar, markdown, kod blokları, thinking katlanır panel, tool kutuları, conversation list, file panel, vision drop zone
   - Terminalde: sadece banner + `Sen:` prompt + düz yazı → `box`, `progress`, `markdown` yok

## Çözüm Mimarisi

```
                    Ollama 127.0.0.1:11434
                         ▲
                         │  /api/chat (stream: true, NDJSON)
            ┌────────────┼────────────┐
            │            │            │
     terminal.js  terminal-plus.js  web-ui/server.js (fetch proxy)
            │            │            │
            └────────────┼────────────┘
                         ▼
                    Qwen35Agent (src/agent.ts)  ← tek kaynak (canonical)
                         │
                    15 Tools (src/tools.ts)
```

### A) Web Streaming Fix (server.js)

**Önce:**
```js
const proxy = http.request(target, {headers:{"Content-Type":...}}, pr=>{
  const headers = {...pr.headers, "Access-Control-Allow-Origin":"*"}
  res.writeHead(pr.statusCode, headers)
  pr.pipe(res)
})
```

**Sonra:**
```js
const r = await fetch(target, {method:req.method, headers:{...}, body, signal})
res.writeHead(r.status, {
  "Content-Type": r.headers.get("content-type") || "application/x-ndjson",
  "Cache-Control":"no-cache",
  "Connection":"keep-alive",
  "X-Accel-Buffering":"no",
  "Access-Control-Allow-Origin":"*",
  "Transfer-Encoding":"chunked",
})
const reader = r.body.getReader()
while(true){ const {done,value}=await reader.read(); if(done)break; res.write(value); if(res.flush) res.flush() }
res.end()
```

**Etki:** Web'de `app.js` artık `🌊 Streaming AÇIK` iken kelime kelime (`█` cursor ile) akıyor, thinking de canlı panelde.

### B) Terminal Rich TUI (terminal-plus.js)

Web'deki her panel terminalde ANSI box ile eşlendi:

| Web Paneli | Terminal Karşılığı |
|---|---|
| Brand + Model select | `╭─ QWEN35-AGENT • Terminal Plus ─╮` + `/model 2` |
| ⚙️ Kontroller (think/stream/smith) | `┌─ ⚙️ Kontroller ─┐` + `/think /stream /smith` |
| Bağlam progress bar | `▓ Context: ████░░░ 34% 8900/32768` |
| Tools (15) | `/tools` → grouped box |
| Vision drop zone | `/vision <dosya> <soru>` (sürükle-bırak = dosya yolu yapıştır) |
| Dosya oluştur | `/write`, `/read`, `/files` |
| Conversation list | `/history` + `~/.qwen35-history.json` |
| Export/Import | `/export`, `/import` (web JSON ile uyumlu) |
| Smith Badge | `[Smith Otonom: 3-faz...]` otomatik eklenir |

**Ekstra terminal-only özellikler:**
- `/settings` → tüm ayarlar tek panel
- `/ui` → web UI'ı tarayıcıda aç (+ server yoksa otomatik `node web-ui/server.js`)
- `/copy` → son kod bloğunu panoya kopyala (Windows `clip`)
- Markdown terminal render: ``` blokları `╭─ js ─╮` kutular, **bold**, `code`
- Thinking canlı: spinner `⠋⠙⠹` + dim gri akış, bitince `── thinking bitti (342 chars) ──`
- Tool kutuları: `┌─ 🔧 2 araç ─┐` → `→ write_file` → `↳ ✅ Written...`

### C) Ortak Çekirdek

Her iki arayüz de aynı `TOOLS` listesini kullanır (canonical 15). Token hesabı, context progress, tool executor aynı `resolvePath` mantığı (Desktop). Böylece web'de yazılan dosya terminalde `/read` ile görülür.

## Kullanım

### Web (streaming fix test)
```
start-web.bat  -> http://127.0.0.1:5173 -> 🌊 Streaming AÇIK -> mesaj gönder -> kelime kelime akış
```

### Terminal Classic
```
run.bat -> node terminal.js
```

### Terminal Plus (ÖNERİLEN)
```
run-plus.bat  veya  node terminal-plus.js
# veya
bun run dev:plus
npm run dev:plus

Komutlar: /help ile tümünü gör
/model        → model değiştir (web select ile aynı)
/think        → thinking aç (web toggle)
/ctx 131072   → 128K context (web select)
/temp 0.9     → temperature
/files        → web Hızlı Dosyalar paneli gibi
/vision foto.jpg ne var?  → web drop-zone gibi
/ui           → web'i aç (hybrid mod)
/copy         → son kod bloğunu kopyala
```

## Dosyalar

- `web-ui/server.js` → FIXED (fetch streaming proxy)
- `terminal-plus.js` → YENİ (Rich TUI, web ile eşdeğer)
- `terminal.js` → korundu (backward compat)
- `run-plus.bat` → YENİ launcher
- `COZUM.md` → bu dosya

## Neden Terminalde Web UI Gibi Tasarlanamıyordu?

Terminal CSS/HTML yok → `box-drawing` (`╭─│╰`) + ANSI renk ile web'in dark premium UI'ı taklit edildi. `blessed`, `ink` gibi ağır bağımlılık olmadan, sadece Node built-in ile web'in tüm panelleri terminale taşındı. İstersen `blessed` ekleyip tam `grid` yapılabilir ama şu anki çözüm bağımlılık eklemeden çalışır.

## Gelecek İyileştirme (opsiyonel)

- `web-ui/index.html` içine `<div id="xterm">` + `xterm.js` bridge ekle → web içinde terminal gömülü
- `terminal-plus.js` için `ink` (React) versiyonu → gerçek panel layout
- WebSocket bridge: tek `server.js` hem web hem terminal client'a aynı stream'i push eder

