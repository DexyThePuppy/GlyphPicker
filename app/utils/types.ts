export interface SymbolEntry {
  name: string
  code: number
  hex: string
  char: string
  inFont: boolean
}

export interface SymbolCatalog {
  version: string
  fontFamily: string
  total: number
  inFont: number
  symbols: SymbolEntry[]
}

export interface WeightOption {
  label: string
  weight: number
  file: string
}
