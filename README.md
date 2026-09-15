# Qwen35-Agent

**Qwen3.5:9b** üzerine kurulu özelleştirilmiş agent. Model ne yapabiliyorsa agent da yapabilir.

## ✨ Özellikler (Modelin tüm yetenekleri)

| Yetenek | Açıklama | Nasıl kullanılır |
|---------|----------|------------------|
| **Vision** | Fotoğraf, ekran görüntüsü, diyagram anlama | `--vision image.png "ne var?"` |
| **Thinking** | Adım adım düşünme (matematik/kod için) | `--think` |
| **256K Context** | 1 kitap kadar uzun doküman | `--ctx 131072` |
| **Tools** | Dosya okuma/yazma, kod çalıştırma | Otomatik |
| **201 Dil** | Türkçe dahil | Otomatik |
| **Kod** | 20+ dilde kod yazma | `--code` |
| **Matematik** | AIME/HMMT seviyesi | `--math` |

## 🚀 Kurulum

```bash
# 1. Model zaten sende var (6.6GB)
ollama list  # qwen3.5:9b görünmeli

# 2. Özelleştirilmiş agent'i oluştur (Modelfile'dan)
cd packages/opencode/qwen35-agent
ollama create qwen35-agent -f Modelfile

# 3. Test et
ollama run qwen35-agent "Merhaba"
# veya CLI ile:
bun run src/cli.ts "Merhaba"
```

## 💻 Kullanım

### Basit sohbet (hızlı)
```bash
bun run src/cli.ts "Türkiye'nin başkenti neresi?"
```

### Thinking modu (zor sorular)
```bash
bun run src/cli.ts --think "Bir çiftlikte 17 koyun var, 9'u hariç hepsi öldü kaç kaldı? Adım adım çöz"
```

### Vision (görsel anlama)
```bash
# Ekran görüntüsü analiz
bun run src/cli.ts --vision ./hata.png "bu hatayı açıkla ve çözümü yaz"
# Fotoğraf analiz
bun run src/cli.ts --vision ./diyagram.jpg "bu diyagramı açıkla"
```

### Kod yazma
```bash
bun run src/cli.ts --code "Python ile binary search yaz, testleri de ekle"
bun run src/cli.ts --code "TypeScript ile todo app, localStorage ile"
```

### Matematik
```bash
bun run src/cli.ts --math "x^2 + 5x + 6 = 0 denklemini çöz, boxed ile ver"
bun run src/cli.ts --math "3x + 2y = 12, 5x - y = 7 sistemini çöz"
```

### Uzun Context
```bash
bun run src/cli.ts --ctx 131072 "10 dosyalık projemi analiz et: ..."
```

## 🧠 Koddan Kullanım

```typescript
import { Qwen35Agent } from "./src/agent.ts"

const agent = new Qwen35Agent({ model: "qwen3.5:9b" })

// Basit chat
await agent.chat({ messages: [{ role: "user", content: "Merhaba" }] })

// Thinking ile matematik
await agent.math("2x + 3 = 11, x nedir?")

// Kod
await agent.code("Rust ile fibonacci")

// Vision
await agent.vision("./image.png", "Bu resimde ne var?")

// Long context
await agent.longContext([doc1, doc2], "Bu dokümanlar ne hakkında?")

// Tool calling ile
import { allTools } from "./src/tools.ts"
await agent.chat({
  messages: [{ role: "user", content: "src/index.ts dosyasını oku ve özetle" }],
  tools: allTools,
  think: true
})
```

## 🔧 Modelfile Özellikleri

- `temperature 0.7`, `top_p 0.9` - dengeli yaratıcılık
- `num_ctx 131072` - 128K varsayılan context
- Türkçe system prompt
- Tool calling aktif

## 📊 qwen2.5-coder:7b vs qwen35-agent karşılaştırma

| | qwen2.5-coder:7b | qwen35-agent (qwen3.5:9b) |
|---|---|---|
| Vision | ❌ | ✅ Natively multimodal |
| Thinking | ❌ | ✅ Toggleable |
| Context | 32K | 256K |
| Matematik | Orta | Çok iyi (AIME %91) |
| Dil | İyi | 201 dil |

## ⚡ İpuçları

- Basit sorular: `--no-think` ile hızlı
- Zor sorular: `--think` ile derin
- Görsel varsa: mutlaka `--vision` kullan
- Kod için: `--code` modu otomatik thinking açar
