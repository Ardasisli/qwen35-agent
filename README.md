# Qwen35-Agent

**Custom agent built on Qwen3.5:9b** — unlocks everything the model can do.

> Local • Private • Fast • 256K Context • Vision • Tools

## ✨ Features

| Capability | Description | Usage |
|---------|-------------|-------|
| **Vision** | Understand photos, screenshots, diagrams | `--vision image.png "what is this?"` |
| **Thinking** | Step-by-step reasoning (math/code) | `--think` |
| **256K Context** | Up to 1 book-length document | `--ctx 131072` |
| **Tools** | File I/O, code execution, web search | Automatic |
| **201 Languages** | Including Turkish & English | Automatic |
| **Code** | 20+ languages | `--code` |
| **Math** | AIME/HMMT level | `--math` |
| **Book Writing** | Professional A5 layout, TOC, pagination, persistent | `write book` |
| **Image Generation** | Pollinations.ai | `generate image` |

## 🚀 Installation

```bash
# 1. Model should be present (6.6GB)
ollama list  # qwen3.5:9b should appear

# 2. Create custom agent from Modelfile
ollama create qwen35-agent -f Modelfile

# 3. Test
ollama run qwen35-agent "Hello"
# or via CLI:
bun run src/cli.ts "Hello"
```

## 💻 Usage

### Simple chat
```bash
bun run src/cli.ts "What is the capital of Turkey?"
```

### Thinking mode (hard questions)
```bash
bun run src/cli.ts --think "There are 17 sheep, all but 9 die, how many remain? Solve step by step"
```

### Vision
```bash
bun run src/cli.ts --vision ./error.png "explain this error and fix it"
```

### Code
```bash
bun run src/cli.ts --code "Write binary search in Python with tests"
```

### Math
```bash
bun run src/cli.ts --math "Solve x^2 + 5x + 6 = 0, give boxed answer"
```

### Book Writing — Professional Layout
```bash
# Create and auto-write a 4-page children's book
bun run src/cli.ts "write a children's book 'Secrets of Rome' about adventure in Rome, 4 pages"

# Continue in a new chat via directory
bun run src/cli.ts --think "Continue C:\Users\excalibur\Desktop\Kitaplar\Secrets-of-Rome, add 2 more pages"
```
**Book features:**
- A5 professional layout (20mm/18mm/15mm margins, page numbers bottom-center)
- Cover, colophon, table of contents with dot leaders
- Chapters start on right page, justified, hyphenation, drop-cap
- Persistent under `Desktop/Kitaplar/` — continue in new chat via `book_extend` with directory path
- Sanitization: strips `<think>`, duplicate paragraphs, loops

### Web UI & Terminal — One Click

This project has **both** a modern Web UI and a powerful Terminal. Just double-click a `.bat` file — no command line needed.

| File | What it does | How to run |
|------|--------------|------------|
| **`start-web.bat`** | Starts the **Web Site** at `http://localhost:5173` — Chat, Vision drag & drop, Controls (Thinking/Streaming/Smith), 20 Tools + Book always active, Context bar, file chips (`@`) | **Double-click** `start-web.bat` → browser opens automatically |
| **`run.bat`** | Starts the **Terminal** (classic CLI) — `bun run src/cli.ts` | Double-click `run.bat` |
| **`run-plus.bat`** | Starts **Terminal Plus** — enhanced terminal with extra features (`terminal-plus.js`) | Double-click `run-plus.bat` |
| **`terminal.js` / `terminal-plus.js`** | Underlying Node terminals (used by the `.bat` files) | `node terminal.js` / `node terminal-plus.js` |
| **`tui-advanced.tsx`** | Advanced TUI (Blessed + OpenTUI) | `bun run tui` |

**Web UI quick start:**
```bash
# Option 1: double-click (Windows)
start-web.bat

# Option 2: command line
bun run web-ui/server.js
# open http://localhost:5173
```
- Chat with Vision drag & drop
- Controls: Thinking / Streaming / Smith (autonomous 3-phase)
- Tools: Web / Files / Code / Vision + Book (always active)
- Context bar, file chips (`@` to select files), book status

**Terminal quick start:**
```bash
# Option 1: double-click
run.bat          # or run-plus.bat for Plus version

# Option 2: command line
bun run src/cli.ts "Hello"
node terminal.js
```

## 🧠 Code Usage

```typescript
import { Qwen35Agent } from "./src/agent.ts"

const agent = new Qwen35Agent({ model: "qwen35-agent" })

// Simple chat
await agent.chat({ messages: [{ role: "user", content: "Hello" }] })

// Math with thinking
await agent.math("2x + 3 = 11, find x")

// Vision
await agent.vision("./image.png", "What is in this image?")

// Tool calling
import { allToolsWithBook } from "./src/tools.ts"
await agent.chat({
  messages: [{ role: "user", content: "read src/index.ts and summarize" }],
  tools: allToolsWithBook,
  think: true
})
```

## 🔧 Available Tools (all English)

| Tool | Description |
|------|-------------|
| `write_file` | Write content to file (auto Desktop) |
| `read_file` | Read file with offset/limit |
| `list_files` | List directory |
| `edit_file` | Edit by exact string replace |
| `delete_file` | Delete file/dir |
| `create_directory` | Create directory |
| `search_files` | Grep search |
| `move_file` | Move/rename |
| `run_python` | Execute Python |
| `run_javascript` | Execute JS via Node |
| `run_bash` | Execute shell |
| `run_sandbox` | Test in isolated temp dir |
| `web_search` | DuckDuckGo search |
| `fetch_url` | Fetch URL |
| `get_system_info` | System info |
| `generate_image` | Generate image via Pollinations.ai |
| `book_create` | CREATE NEW BOOK |
| `book_status` | GET BOOK STATUS (supports directory) |
| `book_add_chapter` | ADD CHAPTER |
| `book_write` | WRITE BOOK / CONTINUE |
| `book_generate` | GENERATE BOOK (html/pdf/docx/epub) |
| `book_extend` | EXTEND BOOK - add pages from directory |

All book tools support **full directory path** for continuing in a new chat:
```js
book_extend(kitapYolu="C:\\Users\\excalibur\\Desktop\\Kitaplar\\MyBook", ekSayfa=2)
```

## 📖 Book System

Books are stored at `C:\Users\excalibur\Desktop\Kitaplar\<slug>\`
- `kitap.json` — metadata
- `bolumler/bolum-01.md` — chapters
- `kitap.html` — professional print-ready A5

In a new chat, just give the directory:
> `C:\Users\excalibur\Desktop\Kitaplar\Secrets-of-Rome add 2 pages from where we left off`

## ⚙️ Modelfile

- `temperature 0.7`, `top_p 0.9`
- `num_ctx 131072` (128K default, up to 256K)
- English system prompt, tool calling enabled

## 📊 Comparison

| | qwen2.5-coder:7b | qwen35-agent |
|---|---|---|
| Vision | ❌ | ✅ Natively multimodal |
| Thinking | ❌ | ✅ Toggleable |
| Context | 32K | 256K |
| Math | Medium | Excellent (AIME 91%) |
| Languages | Good | 201 |

## 📄 License

MIT — see `Modelfile` for Ollama usage.
