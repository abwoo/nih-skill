/**
 * API Security Utilities for BME Research Accelerator
 * Provides input validation, rate limiting, and secure response formatting
 */

import { NextRequest, NextResponse } from "next/server"

/**
 * Unified API Response helper with consistent error handling
 */
export class ApiResponse {
  private static createMeta(additional?: Record<string, unknown>) {
    return {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      version: "2.0.0",
      ...additional,
    }
  }

  static success(data: unknown, meta?: Record<string, unknown>, status: number = 200) {
    return NextResponse.json({
      success: true,
      data,
      meta: this.createMeta(meta),
    }, { status })
  }

  static error(
    message: string, 
    status: number = 500, 
    details?: unknown,
    code?: string
  ) {
    const errorResponse = {
      success: false,
      error: {
        message,
        code: code || `ERR_${status}`,
        details: this.isDev() ? details : undefined,
        timestamp: new Date().toISOString(),
      },
    }

    // Log errors (except client errors)
    if (status >= 500) {
      console.error(`[API] ${status}: ${message}`, details || '')
    } else if (status >= 400) {
      console.warn(`[API] ${status}: ${message}`)
    }

    return NextResponse.json(errorResponse, { status })
  }

  static validationError(message: string, field?: string) {
    return this.error(
      field ? `Validation failed for '${field}': ${message}` : message,
      400,
      undefined,
      'VALIDATION_ERROR'
    )
  }

  static notFound(message: string = 'Resource not found') {
    return this.error(message, 404, undefined, 'NOT_FOUND')
  }

  static unauthorized(message: string = 'Authentication required') {
    return this.error(message, 401, undefined, 'UNAUTHORIZED')
  }

  static forbidden(message: string = 'Access denied') {
    return this.error(message, 403, undefined, 'FORBIDDEN')
  }

  static rateLimited(retryAfterSeconds: number = 60) {
    return NextResponse.json({
      success: false,
      error: {
        message: 'Rate limit exceeded',
        code: 'RATE_LIMITED',
        retryAfter: retryAfterSeconds,
        timestamp: new Date().toISOString(),
      },
    }, { 
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    })
  }

  private static isDev(): boolean {
    return process.env.NODE_ENV === 'development'
  }
}

/**
 * Input Validation Utility
 */
export class RequestValidator {
  /**
   * Validate request body with schema
   */
  static async validateBody<T>(
    request: NextRequest,
    options: {
      requiredFields?: string[]
      maxBodySize?: number
      contentType?: string[]
      validator?: (data: unknown) => T | { error: string }
    }
  ): Promise<{ valid: boolean; data?: T; error?: string; status: number }> {
    
    try {
      // 1. Content-Type check
      const contentType = request.headers.get('content-type')
      if (options.contentType && contentType) {
        const isValid = options.contentType.some(ct => 
          contentType.toLowerCase().includes(ct.toLowerCase())
        )
        if (!isValid) {
          return {
            valid: false,
            error: `Invalid content-type. Expected: ${options.contentType.join(', ')}`,
            status: 415,
          }
        }
      }

      // 2. Body size check
      if (options.maxBodySize) {
        const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
        if (contentLength > options.maxBodySize) {
          return {
            valid: false,
            error: `Request body too large. Max: ${(options.maxBodySize / 1024 / 1024).toFixed(1)}MB`,
            status: 413,
          }
        }
      }

      // 3. Parse and validate body
      let data: unknown
      try {
        data = await request.json()
      } catch (parseError) {
        return {
          valid: false,
          error: 'Invalid JSON in request body',
          status: 400,
        }
      }

      // 4. Required fields check
      if (options.requiredFields && Array.isArray(options.requiredFields)) {
        const objData = data as Record<string, unknown>
        for (const field of options.requiredFields) {
          if (!objData[field]) {
            return {
              valid: false,
              error: `Missing required field: '${field}'`,
              status: 400,
            }
          }
        }
      }

      // 5. Custom validation
      if (options.validator) {
        const result = options.validator(data)
        const validationResult = result as { error?: string } | any
        if (validationResult && 'error' in validationResult && validationResult.error) {
          return {
            valid: false,
            error: validationResult.error,
            status: 400,
          }
        }
        
        return { valid: true, data: result as T, status: 200 }
      }

      return { valid: true, data: data as T, status: 200 }
      
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        status: 500,
      }
    }
  }

  /**
   * Sanitize string input to prevent injection
   */
  static sanitizeString(input: string, maxLength: number = 10000): string {
    if (!input || typeof input !== 'string') return ''
    
    // Truncate length
    let sanitized = input.substring(0, maxLength)
    
    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    
    // Trim whitespace
    sanitized = sanitized.trim()
    
    return sanitized
  }

  /**
   * Validate DOI format
   */
  static isValidDOI(doi: string): boolean {
    const doiPattern = /^10\.\d{4,9}\/[^\s]+$/
    return doiPattern.test(doi.trim())
  }

  /**
   * Validate URL format
   */
  static isValidURL(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }
}

/**
 * In-memory Rate Limiter
 */
class RateLimiterEntry {
  count: number
  resetTime: number
  
  constructor(count: number, resetTime: number) {
    this.count = count
    this.resetTime = resetTime
  }
}

export class RateLimiter {
  private entries = new Map<string, RateLimiterEntry>()
  
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(private defaultLimit: number = 100, private windowMs: number = 60000) {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
    
    // Don't prevent process exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Check if request is allowed
   */
  check(ip: string, customLimit?: number, customWindowMs?: number): boolean {
    const now = Date.now()
    const limit = customLimit ?? this.defaultLimit
    const windowMs = customWindowMs ?? this.windowMs
    
    let entry = this.entries.get(ip)
    
    // Reset if window has passed or entry doesn't exist
    if (!entry || now > entry.resetTime) {
      entry = new RateLimiterEntry(1, now + windowMs)
      this.entries.set(ip, entry)
      return true
    }
    
    // Check if under limit
    if (entry.count < limit) {
      entry.count++
      return true
    }
    
    return false
  }

  /**
   * Get remaining requests and reset time
   */
  getStatus(ip: string): { remaining: number; resetTime: number; limited: boolean } {
    const entry = this.entries.get(ip)
    
    if (!entry || Date.now() > entry.resetTime) {
      return { 
        remaining: this.defaultLimit, 
        resetTime: Date.now() + this.windowMs,
        limited: false,
      }
    }
    
    return {
      remaining: Math.max(0, this.defaultLimit - entry.count),
      resetTime: entry.resetTime,
      limited: entry.count >= this.defaultLimit,
    }
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.entries.clear()
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [ip, entry] of this.entries) {
      if (now > entry.resetTime) {
        this.entries.delete(ip)
      }
    }
  }

  /**
   * Destroy the rate limiter (cleanup interval)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Global instance
export const globalRateLimiter = new RateLimiter()

/**
 * API Key Encryption/Decryption utilities
 */
export class APIKeyUtils {
  /**
   * Mask API key for logging (show first 8 chars + last 4)
   */
  static maskForLogging(apiKey: string | null | undefined): string {
    if (!apiKey) return '(not set)'
    
    if (apiKey.length <= 12) {
      return `${apiKey.substring(0, 3)}...`
    }
    
    return `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
  }

  /**
   * Validate API key format (basic check)
   */
  static isValidFormat(apiKey: string | null | undefined): boolean {
    if (!apiKey || typeof apiKey !== 'string') return false
    
    // Common API key patterns
    const patterns = [
      /^sk-[a-zA-Z0-9]{20,}/,           // OpenAI style
      /^sk-[a-zA-Z0-9_-]{32,}/,         // OpenAI newer
      /^[a-f0-9]{32,}$/i,                // Hex format
      /^[\w-]{20,}$/,                   // Generic alphanumeric
    ]
    
    return patterns.some(p => p.test(apiKey.trim()))
  }
}
