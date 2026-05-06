/**
 * Unified Logger for BME Research Accelerator
 * Provides structured logging with environment-aware output
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  module: string
  message: string
  data?: unknown
}

class Logger {
  private static isDev = process.env.NODE_ENV === 'development'
  private static isTest = process.env.NODE_ENV === 'test'
  
  private static formatMessage(level: LogLevel, module: string, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`
  }

  private static shouldLog(level: LogLevel): boolean {
    // Always log errors and warnings in all environments
    if (level === 'error' || level === 'warn') return true
    
    // Only log info/debug in development or test
    return this.isDev || this.isTest
  }

  static log(module: string, message: string, data?: unknown): void {
    if (!this.shouldLog('log')) return
    
    const formatted = this.formatMessage('log', module, message)
    
    if (data !== undefined) {
      console.log(formatted, data)
    } else {
      console.log(formatted)
    }
  }

  static warn(module: string, message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return
    
    const formatted = this.formatMessage('warn', module, message)
    
    if (data !== undefined) {
      console.warn(formatted, data)
    } else {
      console.warn(formatted)
    }
  }

  static error(module: string, message: string, error?: Error | unknown): void {
    const formatted = this.formatMessage('error', module, message)
    
    if (error instanceof Error) {
      console.error(formatted, {
        name: error.name,
        message: error.message,
        stack: this.isDev ? error.stack : undefined,
      })
    } else if (error !== undefined) {
      console.error(formatted, error)
    } else {
      console.error(formatted)
    }
  }

  static debug(module: string, message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) return
    
    const formatted = this.formatMessage('debug', module, message)
    
    if (data !== undefined) {
      console.debug(formatted, data)
    } else {
      console.debug(formatted)
    }
  }

  /**
   * Create a scoped logger for a specific module
   */
  static createScope(moduleName: string) {
    return {
      log: (msg: string, data?: unknown) => Logger.log(moduleName, msg, data),
      warn: (msg: string, data?: unknown) => Logger.warn(moduleName, msg, data),
      error: (msg: string, err?: Error | unknown) => Logger.error(moduleName, msg, err),
      debug: (msg: string, data?: unknown) => Logger.debug(moduleName, msg, data),
    } as const
  }
}

// Export singleton instance with common scopes
export const logger = {
  pdf: Logger.createScope('pdf-parser'),
  fetchPaper: Logger.createScope('fetch-paper'),
  doiResolver: Logger.createScope('doi-resolver'),
  api: Logger.createScope('api'),
  chat: Logger.createScope('chat'),
  skillInfo: Logger.createScope('skill-info'),
  search: Logger.createScope('search'),
  parsePdf: Logger.createScope('parse-pdf'),
  gateway: Logger.createScope('gateway'),
  store: Logger.createScope('store'),
  centerPanel: Logger.createScope('center-panel'),
  settings: Logger.createScope('settings'),
  markdown: Logger.createScope('markdown'),
}

export default Logger
