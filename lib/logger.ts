const isDev = process.env.NODE_ENV === 'development'

type LogLevel = 'log' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  args: unknown[]
  timestamp: string
}

class Logger {
  private enabled: boolean
  private history: LogEntry[] = []
  private maxHistory: number

  constructor(enabled = true, maxHistory = 100) {
    this.enabled = enabled && isDev
    this.maxHistory = maxHistory
  }

  private formatPrefix(level: LogLevel, tag?: string): string {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12)
    const prefix = tag ? `[${tag}]` : ''
    const levelEmoji = {
      log: '📝',
      warn: '⚠️',
      error: '❌',
      debug: '🔍'
    }
    return `${timestamp} ${levelEmoji[level]} ${prefix}`
  }

  log(...args: unknown[]) {
    if (this.enabled) {
      console.log(this.formatPrefix('log'), ...args)
    }
    this.addToHistory('log', args)
  }

  warn(...args: unknown[]) {
    console.warn(this.formatPrefix('warn'), ...args)
    this.addToHistory('warn', args)
  }

  error(...args: unknown[]) {
    console.error(this.formatPrefix('error'), ...args)
    this.addToHistory('error', args)
  }

  debug(tag: string, ...args: unknown[]) {
    if (this.enabled) {
      console.log(this.formatPrefix('debug', tag), ...args)
    }
    this.addToHistory('debug', [`[${tag}]`, ...args])
  }

  private addToHistory(level: LogLevel, args: unknown[]) {
    this.history.push({
      level,
      args,
      timestamp: new Date().toISOString()
    })
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
  }

  getHistory(): LogEntry[] {
    return [...this.history]
  }

  clearHistory() {
    this.history = []
  }
}

export const logger = new Logger()

// Named loggers for different modules (prevents "Cannot read properties of undefined" errors)
export const namedLoggers = {
  pdf: new Logger(true, 50),      // PDF parsing logger
  doi: new Logger(true, 50),      // DOI resolution logger
  api: new Logger(true, 100),     // API request logger
  search: new Logger(true, 80),  // Search service logger
  llm: new Logger(true, 60),     // LLM analysis logger
}

// Backward compatibility: add pdf property to main logger
;(logger as any).pdf = namedLoggers.pdf
;(logger as any).doi = namedLoggers.doi
;(logger as any).api = namedLoggers.api
;(logger as any).search = namedLoggers.search
;(logger as any).llm = namedLoggers.llm

export default logger