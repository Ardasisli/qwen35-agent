/**
 * Qwen35-Agent Hooks - Otomatik işlemler (Smith hooks)
 * Dosya yazmadan önce/sonra, hata olunca otomatik çalışır
 */

export type HookType = "pre_write" | "post_write" | "pre_read" | "post_run" | "on_error" | "on_success"

export interface Hook {
  type: HookType
  name: string
  enabled: boolean
  run: (ctx: Record<string, unknown>) => Promise<string | void>
}

export const HOOKS: Hook[] = [
  {
    type: "pre_write",
    name: "path_check",
    enabled: true,
    run: async (ctx) => {
      const p = ctx.path as string
      if (!p) return "path gerekli"
      if (p.includes("..")) return "Geçersiz path: .. içeremez"
      return
    },
  },
  {
    type: "post_write",
    name: "remember_file",
    enabled: true,
    run: async (ctx) => {
      // memory.ts tarafından hatırlanacak
      return `Dosya yazıldı: ${ctx.path}`
    },
  },
  {
    type: "on_error",
    name: "log_error",
    enabled: true,
    run: async (ctx) => {
      const err = ctx.error as string
      // learning.ts tarafından öğrenilecek
      return `Hata kaydedildi: ${err.slice(0, 100)}`
    },
  },
  {
    type: "post_run",
    name: "check_output",
    enabled: true,
    run: async (ctx) => {
      const out = ctx.output as string
      const err = ctx.error as string
      if (err && err.includes("SyntaxError")) return "Syntax hatası - düzeltme öner"
      if (out && out.length > 5000) return "Çıktı çok uzun, özetle"
      return
    },
  },
]

export async function runHooks(type: HookType, ctx: Record<string, unknown>): Promise<string[]> {
  const results: string[] = []
  for (const hook of HOOKS) {
    if (hook.type !== type || !hook.enabled) continue
    try {
      const r = await hook.run(ctx)
      if (r) results.push(`[${hook.name}] ${r}`)
    } catch (e) {
      results.push(`[${hook.name} hata] ${(e as Error).message}`)
    }
  }
  return results
}

export async function addHook(hook: Hook): Promise<void> {
  HOOKS.push(hook)
}
