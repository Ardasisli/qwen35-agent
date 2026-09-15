/**
 * Qwen35-Agent Skills - Like Smith, decides autonomously, no / command
 * Selects required skill based on prompt
 */

export interface Skill {
  name: string
  description: string
  keywords: string[]
  tools: string[] // hangi tool'lar gerekli
  autoFix?: string
}

export const SKILLS: Skill[] = [
  {
    name: "explore",
    description: "Explore codebase, find files, understand structure",
    keywords: ["ara", "bul", "incele", "yapı", "listele", "keşfet", "nerede", "hangi dosya", "explore", "find", "structure"],
    tools: ["list_files", "search_files", "read_file", "get_system_info"],
  },
  {
    name: "code",
    description: "Write code, create and edit files",
    keywords: ["yaz", "oluştur", "ekle", "kod", "yap", "dosya", "implement", "write", "create", "edit", "code"],
    tools: ["write_file", "edit_file", "read_file"],
  },
  {
    name: "test",
    description: "Test in sandbox, verify",
    keywords: ["test", "dene", "çalıştır", "doğrula", "kontrol", "kum havuzu", "verify", "run"],
    tools: ["run_sandbox", "run_python", "run_javascript", "run_bash"],
  },
  {
    name: "review",
    description: "Review code, evaluate and suggest improvements",
    keywords: ["incele", "kontrol", "değerlendir", "review", "bak", "evaluate"],
    tools: ["read_file", "search_files"],
  },
  {
    name: "debug",
    description: "Find and fix bugs",
    keywords: ["hata", "çalışmıyor", "sorun", "bug", "düzelt", "fix", "error", "fail"],
    tools: ["read_file", "search_files", "run_sandbox", "edit_file"],
    autoFix: "Read the error, find the relevant file, fix it and test in sandbox",
  },
  {
    name: "web",
    description: "Search the web, get up-to-date information",
    keywords: ["ara", "internet", "web", "güncel", "nedir", "nasıl", "araştır", "search", "fetch"],
    tools: ["web_search", "fetch_url"],
  },
  {
    name: "file_ops",
    description: "File operations: delete, move, create directories",
    keywords: ["sil", "taşı", "klasör", "dizin", "yeniden adlandır", "delete", "move", "create"],
    tools: ["delete_file", "move_file", "create_directory", "list_files"],
  },
  {
    name: "system",
    description: "System info and environment analysis",
    keywords: ["sistem", "ortam", "ne var", "bilgi", "durum", "system", "info"],
    tools: ["get_system_info", "list_files"],
  },
  {
    name: "image",
    description: "Image generation - create images with Pollinations.ai",
    keywords: ["görsel", "resim", "çiz", "oluştur", "üret", "image", "picture", "generate", "fotoğraf", "manzara", "karakter", "tasarım", "illustration", "draw"],
    tools: ["generate_image"],
  },
]

export function selectSkills(prompt: string): Skill[] {
  const lower = prompt.toLowerCase()
  const matched: { skill: Skill; score: number }[] = []

  for (const skill of SKILLS) {
    let score = 0
    for (const kw of skill.keywords) {
      if (lower.includes(kw.toLowerCase())) score += 1
    }
    // Özel kurallar
    if (skill.name === "code" && (lower.includes(".py") || lower.includes(".js") || lower.includes(".ts"))) score += 2
    if (skill.name === "test" && lower.includes("test")) score += 2
    if (skill.name === "debug" && (lower.includes("hata") || lower.includes("error"))) score += 3
    if (skill.name === "image" && (lower.includes("görsel") || lower.includes("resim") || lower.includes("çiz") || lower.includes("oluştur") || lower.includes("üret") || lower.includes("generate image") || lower.includes("picture"))) score += 5
    if (score > 0) matched.push({ skill, score })
  }

  matched.sort((a, b) => b.score - a.score)
  // En az 1, en fazla 3 skill
  const selected = matched.slice(0, 3).map((m) => m.skill)
  // Hiç eşleşme yoksa code + explore varsayılan
  if (selected.length === 0) return [SKILLS[1], SKILLS[0]]
  return selected
}

export function getToolsForSkills(skills: Skill[]): string[] {
  const set = new Set<string>()
  for (const s of skills) for (const t of s.tools) set.add(t)
  return [...set]
}

export function explainSelection(prompt: string): string {
  const skills = selectSkills(prompt)
  return `Seçilen yetenekler: ${skills.map((s) => `${s.name}(${s.tools.join(",")})`).join(" | ")}`
}
