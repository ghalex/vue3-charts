export interface DomainBounds {
  dataMin: number
  dataMax: number
}

/**
 * One end of a numeric axis domain: a number, a function of the data bounds, or a small arithmetic
 * expression over `dataMin` / `dataMax` such as `'dataMax + 100'` or `'min(0, dataMin)'`.
 */
export type DomainValue = number | string | ((bounds: DomainBounds) => number)

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  min: Math.min,
  max: Math.max,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil
}

type Token = { kind: 'number'; value: number } | { kind: 'ident'; value: string } | { kind: 'op'; value: string }

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) {
      i++
    } else if (/[0-9.]/.test(ch)) {
      const match = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(src.slice(i))
      if (!match) throw new SyntaxError(`Invalid number in domain expression "${src}"`)
      tokens.push({ kind: 'number', value: Number(match[0]) })
      i += match[0].length
    } else if (/[a-zA-Z_]/.test(ch)) {
      const match = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(src.slice(i)) as RegExpExecArray
      tokens.push({ kind: 'ident', value: match[0] })
      i += match[0].length
    } else if ('+-*/(),'.includes(ch)) {
      tokens.push({ kind: 'op', value: ch })
      i++
    } else {
      throw new SyntaxError(`Unexpected character "${ch}" in domain expression "${src}"`)
    }
  }
  return tokens
}

/** Recursive-descent evaluator: expr := term (('+'|'-') term)*, term := unary (('*'|'/') unary)*. */
function evaluate(src: string, bounds: DomainBounds): number {
  const tokens = tokenize(src)
  let pos = 0

  const peek = () => tokens[pos]
  const isOp = (value: string) => peek()?.kind === 'op' && peek().value === value
  const expectOp = (value: string) => {
    if (!isOp(value)) throw new SyntaxError(`Expected "${value}" in domain expression "${src}"`)
    pos++
  }

  const primary = (): number => {
    const token = peek()
    if (!token) throw new SyntaxError(`Unexpected end of domain expression "${src}"`)
    pos++
    if (token.kind === 'number') return token.value
    if (token.kind === 'ident') {
      if (token.value in bounds) return bounds[token.value as keyof DomainBounds]
      if (token.value in FUNCTIONS) {
        expectOp('(')
        const args: number[] = []
        if (!isOp(')')) {
          args.push(expr())
          while (isOp(',')) {
            pos++
            args.push(expr())
          }
        }
        expectOp(')')
        return FUNCTIONS[token.value](...args)
      }
      throw new SyntaxError(`Unknown identifier "${token.value}" in domain expression "${src}"`)
    }
    if (token.value === '(') {
      const value = expr()
      expectOp(')')
      return value
    }
    throw new SyntaxError(`Unexpected "${token.value}" in domain expression "${src}"`)
  }

  const unary = (): number => {
    if (isOp('-')) {
      pos++
      return -unary()
    }
    if (isOp('+')) {
      pos++
      return unary()
    }
    return primary()
  }

  const term = (): number => {
    let value = unary()
    while (isOp('*') || isOp('/')) {
      const op = (peek() as { value: string }).value
      pos++
      const rhs = unary()
      value = op === '*' ? value * rhs : value / rhs
    }
    return value
  }

  const expr = (): number => {
    let value = term()
    while (isOp('+') || isOp('-')) {
      const op = (peek() as { value: string }).value
      pos++
      const rhs = term()
      value = op === '+' ? value + rhs : value - rhs
    }
    return value
  }

  const result = expr()
  if (pos < tokens.length) throw new SyntaxError(`Unexpected trailing input in domain expression "${src}"`)
  return result
}

export function evaluateDomain(value: DomainValue, bounds: DomainBounds): number {
  if (typeof value === 'number') return value
  if (typeof value === 'function') return value(bounds)
  return evaluate(value, bounds)
}
