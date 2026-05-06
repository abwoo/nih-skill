import type { DOIMatchStrategy, DOIExtractionConfig } from "./doi-extractor-types"
import type { DOIEnrichmentConfig } from "./doi-metadata-enricher"
import type { DOIGatewayConfig } from "./doi-gateway"
import { DEFAULT_DOI_STRATEGIES, DEFAULT_EXTRACTION_CONFIG } from "./doi-extractor-types"
import { DEFAULT_ENRICHMENT_CONFIG } from "./doi-metadata-enricher"
import { DEFAULT_GATEWAY_CONFIG } from "./doi-gateway"

export interface DOISystemConfig {
  version: string
  lastUpdated: string
  
  extraction: {
    enabled: boolean
    strategies: DOIMatchStrategy[]
    config: DOIExtractionConfig
  }
  
  enrichment: {
    enabled: boolean
    config: DOIEnrichmentConfig
  }
  
  gateway: DOIGatewayConfig
}

const CONFIG_VERSION = "1.0.0"

let currentConfig: DOISystemConfig = {
  version: CONFIG_VERSION,
  lastUpdated: new Date().toISOString(),
  
  extraction: {
    enabled: true,
    strategies: [...DEFAULT_DOI_STRATEGIES],
    config: { ...DEFAULT_EXTRACTION_CONFIG },
  },
  
  enrichment: {
    enabled: true,
    config: { ...DEFAULT_ENRICHMENT_CONFIG },
  },
  
  gateway: { ...DEFAULT_GATEWAY_CONFIG },
}

function validateStrategy(strategy: Partial<DOIMatchStrategy>): DOIMatchStrategy | null {
  if (!strategy.id || !strategy.name) return null
  
  return {
    id: strategy.id,
    name: strategy.name,
    description: strategy.description || "",
    patterns: strategy.patterns || [],
    priority: strategy.priority ?? 50,
    enabled: strategy.enabled !== false,
  }
}

export function getDOISystemConfig(): DOISystemConfig {
  return { ...currentConfig }
}

export function updateExtractionStrategies(strategies: Partial<DOIMatchStrategy>[]): DOISystemConfig {
  const validatedStrategies = strategies.map(validateStrategy).filter((s): s is DOIMatchStrategy => s !== null)
  
  if (validatedStrategies.length > 0) {
    currentConfig.extraction.strategies = validatedStrategies
    currentConfig.lastUpdated = new Date().toISOString()
  }
  
  return getDOISystemConfig()
}

export function enableExtractionStrategy(strategyId: string, enabled: boolean): DOISystemConfig {
  const strategy = currentConfig.extraction.strategies.find(s => s.id === strategyId)
  
  if (strategy) {
    strategy.enabled = enabled
    currentConfig.lastUpdated = new Date().toISOString()
  }
  
  return getDOISystemConfig()
}

export function updateExtractionConfig(config: Partial<DOIExtractionConfig>): DOISystemConfig {
  currentConfig.extraction.config = { ...currentConfig.extraction.config, ...config }
  currentConfig.lastUpdated = new Date().toISOString()
  
  return getDOISystemConfig()
}

export function updateEnrichmentConfig(config: Partial<DOIEnrichmentConfig>): DOISystemConfig {
  currentConfig.enrichment.config = { ...currentConfig.enrichment.config, ...config }
  currentConfig.gateway.enrichment = { ...currentConfig.gateway.enrichment, ...config }
  currentConfig.lastUpdated = new Date().toISOString()
  
  return getDOISystemConfig()
}

export function setGatewayConfig(config: Partial<DOIGatewayConfig>): DOISystemConfig {
  currentConfig.gateway = { ...currentConfig.gateway, ...config }
  currentConfig.lastUpdated = new Date().toISOString()
  
  return getDOISystemConfig()
}

export function resetToDefaults(): DOISystemConfig {
  currentConfig = {
    version: CONFIG_VERSION,
    lastUpdated: new Date().toISOString(),
    
    extraction: {
      enabled: true,
      strategies: [...DEFAULT_DOI_STRATEGIES],
      config: { ...DEFAULT_EXTRACTION_CONFIG },
    },
    
    enrichment: {
      enabled: true,
      config: { ...DEFAULT_ENRICHMENT_CONFIG },
    },
    
    gateway: { ...DEFAULT_GATEWAY_CONFIG },
  }
  
  return getDOISystemConfig()
}

export function exportConfig(): string {
  return JSON.stringify(currentConfig, null, 2)
}

export function importConfig(configJson: string): { success: boolean; error?: string; config?: DOISystemConfig } {
  try {
    const imported = JSON.parse(configJson)
    
    if (!imported.version || !imported.extraction || !imported.enrichment) {
      return { success: false, error: "Invalid configuration format" }
    }
    
    currentConfig = {
      ...imported,
      lastUpdated: new Date().toISOString(),
    }
    
    return { success: true, config: getDOISystemConfig() }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to parse configuration"
    return { success: false, error: errorMsg }
  }
}
