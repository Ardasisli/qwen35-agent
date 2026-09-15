/**
 * Qwen35-Agent Image Generation - Pollinations.ai
 * https://image.pollinations.ai/prompt/{prompt}
 * 
 * Usage: when user says "create cat picture"
 * 1. Translate request to detailed English visual prompt (artistic)
 * 2. Build URL: https://image.pollinations.ai/prompt/<encoded prompt>
 * 3. Return as image in message box
 */

import type { Tool } from "./agent"

export interface GenerateImageOptions {
  prompt: string // İngilizce detaylı prompt
  width?: number // varsayılan 1024
  height?: number // varsayılan 1024
  seed?: number // rastgele ise -1
  model?: string // flux, turbo, etc
  nologo?: boolean
  enhance?: boolean // pollinations enhance
  negative_prompt?: string
}

// Pollinations URL builder - en güvenilir format
export function buildPollinationsUrl(opts: GenerateImageOptions): string {
  const encodedPrompt = encodeURIComponent(opts.prompt.trim())
  const params = new URLSearchParams()
  params.set("width", String(opts.width ?? 1024))
  params.set("height", String(opts.height ?? 1024))
  params.set("model", opts.model ?? "flux")
  params.set("nologo", String(opts.nologo ?? true))
  // enhance ve negative opsiyonel
  if (opts.enhance) params.set("enhance", "true")
  if (opts.seed !== undefined && opts.seed !== -1) params.set("seed", String(opts.seed))
  if (opts.negative_prompt) params.set("negative_prompt", opts.negative_prompt)
  // Pollinations cache bypass için random seed ekle
  if (opts.seed === -1 || opts.seed === undefined) params.set("seed", String(Math.floor(Math.random() * 999999)))

  return `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`
}

// Türkçe isteği İngilizce görsel prompt'a çevirmek için helper
// Model zaten bunu yapacak ama tool içinde de basit çeviri için
export function enhancePromptForImage(userRequest: string): string {
  // Model'e bırakacağız, burada sadece fallback
  return userRequest
}

// Tool definition - Ollama'ya gönderilecek
export const imageTools: Tool[] = [
  {
    type: "function",
    function: {
      name: "generate_image",
      description: "🎨 GENERATE IMAGE - Use MANDATORILY when user asks 'generate image', 'create picture', 'draw', 'generate visual', 'image generate', 'cat picture', 'draw landscape' etc. Translate the request to a detailed English prompt and generate image via Pollinations.ai. Result is shown as image in message box. Even if request is Turkish, make prompt English, detailed, artistic (example: 'cat at sunset' -> 'a cute cat at sunset, highly detailed, digital art, 8k, vibrant colors').",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Detailed English image prompt (e.g. 'a majestic dragon flying over a futuristic city at sunset, cinematic lighting, ultra detailed, 8k') - translate Turkish requests to English and elaborate",
          },
          width: {
            type: "number",
            description: "Width (default 1024, 512-2048)",
          },
          height: {
            type: "number",
            description: "Height (default 1024, square 1024x1024, portrait 768x1360, landscape 1360x768)",
          },
          negative_prompt: {
            type: "string",
            description: "Negative prompt - things to avoid (e.g. 'blurry, low quality, distorted')",
          },
          seed: {
            type: "number",
            description: "Seed (-1 random, same seed = same image)",
          },
        },
        required: ["prompt"],
      },
    },
  },
]

// Executor - Node tarafında çalıştırılır
export async function executeImageTool(name: string, args: Record<string, unknown>): Promise<string> {
  if (name !== "generate_image") throw new Error(`Unknown image tool: ${name}`)

  const prompt = args.prompt as string
  if (!prompt || !prompt.trim()) throw new Error("prompt gerekli - görsel açıklaması yaz")

  const width = (args.width as number) ?? 1024
  const height = (args.height as number) ?? 1024
  const url = buildPollinationsUrl({
    prompt: prompt.trim(),
    width,
    height,
    seed: args.seed as number | undefined,
    negative_prompt: args.negative_prompt as string | undefined,
  })

  // URL'yi test et - isteğe bağlı HEAD kontrolü (pollinations her zaman döner, kontrol etmeye gerek yok)
  // Ama tool sonucu olarak hem URL hem markdown hem HTML döndür

  const result = `✅ Görsel üretildi!

🎨 Prompt: "${prompt}"
📐 Boyut: ${width}x${height}
🔗 URL: ${url}

KRİTİK TALİMAT - SONRAKİ MESAJINDA MUTLAKA ŞU MARKDOWN'U AYNI OLARAK YAZ (kopyala-yapıştır):
![${prompt.slice(0, 60)}](${url})

Bu markdown mesaj kutusunda OTOMATİK görsele dönüşecek. Asla sadece URL yazma, mutlaka ![...](url) formatında yaz!
Kullanıcıya örnek cevap: "İsteğin üzerine bu görseli oluşturdum:\n\n![${prompt.slice(0, 60)}](${url})"

Pollinations direkt link (yedek):
${url}`

  return result
}

export * as ImageNS from "./image"
