import type { SymbolEntry } from './types'

export interface NamingsFile {
  synonyms: Record<string, string[]>
}

export interface ScoredSymbol {
  symbol: SymbolEntry
  score: number
}

/** Expand a query token through the namings synonym table. */
export function expandToken(
  token: string,
  synonyms: Record<string, string[]>,
): string[] {
  const t = token.toLowerCase()
  const out = new Set<string>([t])
  const direct = synonyms[t]
  if (direct) for (const s of direct) out.add(s.toLowerCase())
  return [...out]
}

function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/[\s,_+/|]+/)
    .map((t) => t.replace(/^u\+/, ''))
    .filter(Boolean)
}

function scoreTokenAgainstName(name: string, token: string, expansions: string[]): number {
  const n = name.toLowerCase()
  const parts = n.split('.')

  if (n === token) return 100
  if (n.startsWith(token + '.') || n.startsWith(token)) return 90
  if (parts.includes(token)) return 80
  if (n.includes(token)) return 55

  let best = 0
  for (const exp of expansions) {
    if (exp === token) continue
    if (n === exp) best = Math.max(best, 88)
    else if (n.startsWith(exp + '.') || n.startsWith(exp)) best = Math.max(best, 78)
    else if (parts.some((p) => p === exp || exp.split('.').every((e) => parts.includes(e))))
      best = Math.max(best, 70)
    else if (n.includes(exp)) best = Math.max(best, 50)
  }
  return best
}

function hexMatch(symbol: SymbolEntry, token: string): number {
  const hex = symbol.hex.toLowerCase().replace('u+', '')
  if (token === hex) return 95
  if (/^[0-9a-f]+$/i.test(token) && hex.includes(token)) return 60
  if (String(symbol.code) === token) return 95
  return 0
}

/**
 * Ranked smart search:
 * - splits query into tokens (AND)
 * - expands each token via namings synonyms (OR)
 * - ranks exact / prefix / token / synonym hits
 */
export function searchSymbols(
  symbols: SymbolEntry[],
  query: string,
  synonyms: Record<string, string[]>,
  inFontOnly: boolean,
): ScoredSymbol[] {
  const pool = inFontOnly ? symbols.filter((s) => s.inFont) : symbols
  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) {
    return pool.map((symbol) => ({ symbol, score: 0 }))
  }

  const expanded = tokens.map((t) => expandToken(t, synonyms))
  const results: ScoredSymbol[] = []

  for (const symbol of pool) {
    let total = 0
    let ok = true

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!
      const exps = expanded[i]!
      const nameScore = scoreTokenAgainstName(symbol.name, token, exps)
      const codeScore = hexMatch(symbol, token)
      const charScore = token.length === 1 && symbol.char === token ? 100 : 0
      const best = Math.max(nameScore, codeScore, charScore)
      if (best <= 0) {
        ok = false
        break
      }
      total += best
    }

    if (!ok) continue

    // Prefer shorter / base names slightly
    const brevity = Math.max(0, 12 - symbol.name.split('.').length)
    const inFontBonus = symbol.inFont ? 2 : 0
    results.push({ symbol, score: total + brevity + inFontBonus })
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.symbol.name.localeCompare(b.symbol.name)
  })
  return results
}
