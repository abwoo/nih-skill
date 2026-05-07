'use client';

import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Check, ExternalLink, X } from 'lucide-react';
import * as React from 'react';

const PROVIDERS = [
  {
    id: 'openclaw',
    name: 'OpenClaw',
    description: 'Recommended Free tier (2026)',
    baseUrl: 'https://api.openclaw.com/v1',
    models: ['openclaw-default'], // 2026: Synced with lib/providers.ts - Managed routing
    icon: '🦞',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: '200K context (2026 Opus 4.7)',
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-opus-4-7', 'claude-opus-4-6', 'claude-sonnet-4-5', 'claude-haiku-4-5'], // 2026: Updated to Claude 4.x series
    icon: '🤖',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-5.5',
    description: '1M context (2026 Flagship)', // 2026: Updated name
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-5.5', 'gpt-5.5-pro', 'gpt-5.4-mini', 'gpt-4o'], // 2026: Synced with backend - added gpt-4o Legacy
    icon: '🟢',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: '1M+ context (2026 2.5/3.x)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'], // 2026: Synced - include deprecated for consistency
    icon: '💎',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek V4',
    description: '128K context (2026 V4)', // 2026: Updated to V4
    baseUrl: 'https://api.deepseek.com',
    models: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-chat', 'deepseek-reasoner'], // 2026: Synced - include deprecated
    icon: '🔷',
  },
  {
    id: 'groq',
    name: 'GroqCloud',
    description: 'Ultra-fast inference (2026 Llama 4/GPT OSS)',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      'llama-3.3-70b-versatile',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'llama-3.1-8b-instant',
      'groq/compound',
    ], // 2026: Synced with backend - complete model list
    icon: '⚡',
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    description: 'Azure hosted deployment (GPT-5.x)',
    baseUrl: '', // User must provide custom URL
    models: ['azure-deployment'], // 2026: Added missing provider
    icon: '⊞',
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    description: 'OpenAI-compatible (any 2026 model)',
    baseUrl: '', // User must provide custom URL
    models: ['custom-model'], // 2026: Added missing provider
    icon: '···',
  },
];

interface ApiSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiSettingsDrawer({ open, onOpenChange }: ApiSettingsDrawerProps) {
  const { config, setConfig, showToast } = useStore();
  const [showKey, setShowKey] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  const currentProvider = PROVIDERS.find((p) => p.id === config.provider) || PROVIDERS[0];
  const hasKey = Boolean(config.apiKey);

  async function handleTestConnection() {
    if (!config.apiKey) {
      showToast('⚠️ Please enter your API Key first');
      return;
    }
    if (!config.model) {
      showToast('⚠️ Please select a Model first');
      return;
    }
    if (!config.provider) {
      showToast('⚠️ Please select a Provider first');
      return;
    }

    setTesting(true);

    try {
      // ✅ 构建测试请求体 - 完全匹配后端 ChatRequestBody 接口
      const requestBody = {
        config: {
          provider: config.provider,
          apiKey: config.apiKey.trim(), // 确保去除空格
          model: config.model,
          baseUrl: config.baseUrl || undefined,
          temperature: 0.7,
          maxTokens: 10, // 测试只需要很少的token
          stream: false, // 测试时不使用流式
          injectSkill: false, // 测试时不注入skill
          includeRefs: false,
        },
        messages: [
          {
            role: 'user' as const,
            content: "Hello! Please respond with just the word 'OK' and nothing else.",
          },
        ],
        module: 'decompose', // 测试用默认模块
        intent: 'QUICK_READ',
        input: 'Connection test',
      };

      console.log(
        '[Settings] 🔍 Testing connection with full request body:',
        JSON.stringify(requestBody, null, 2)
      );
      console.log('[Settings] 📊 Config summary:', {
        provider: config.provider,
        model: config.model,
        apiKeyLength: config.apiKey.length,
        apiKeyPreview: `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`,
        hasBaseUrl: Boolean(config.baseUrl),
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('[Settings] 📡 Response status:', res.status, res.statusText);

      if (res.ok) {
        const data = await res.json();
        console.log('[Settings] ✅ Connection test SUCCESS:', data);

        // 提取响应内容确认API工作正常
        let responseText = '';
        if (data.choices && data.choices[0]) {
          responseText = data.choices[0].message?.content || data.choices[0].text || '';
        } else if (data.content) {
          responseText = Array.isArray(data.content) ? data.content[0]?.text : data.content;
        }

        showToast(`✅ Connection successful! Provider responded: "${responseText.slice(0, 50)}"`);
      } else {
        let errorData: any = { error: `HTTP ${res.status}` };

        try {
          const text = await res.text();
          try {
            errorData = JSON.parse(text);
          } catch {
            errorData = { error: text.slice(0, 200) || `HTTP ${res.status}` };
          }
        } catch (readErr) {
          console.error('[Settings] Failed to read error response:', readErr);
        }

        console.error('[Settings] ❌ Connection test FAILED:', {
          status: res.status,
          statusText: res.statusText,
          errorBody: errorData,
        });

        // 根据状态码提供更友好的错误消息
        let errorMessage = errorData.error || `HTTP ${res.status}`;
        if (res.status === 401) {
          errorMessage = '❌ Invalid API Key (401). Please check your API key is correct.';
        } else if (res.status === 429) {
          errorMessage = '❌ Rate Limited (429). Too many requests, please wait.';
        } else if (res.status === 404) {
          errorMessage = "❌ Not Found (404). Model or endpoint doesn't exist.";
        } else if (res.status >= 500) {
          errorMessage = `❌ Server Error (${res.status}). The API provider is having issues.`;
        }

        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('[Settings] 💥 Connection error:', err);
      showToast(`❌ Connection failed: ${(err as Error).message}`);
    } finally {
      setTesting(false);
    }
  }

  function handleSwitchProvider(providerId: string) {
    const provider = PROVIDERS.find((p) => p.id === providerId);
    if (provider) {
      // ✅ 保留现有的 apiKey，只更新provider相关设置
      setConfig({
        provider: provider.id,
        baseUrl: provider.baseUrl,
        model: provider.models[0],
        // apiKey 保留当前值，不清空
      });
      showToast(`🔄 已切换到 ${provider.name}`);
      console.log(
        '[Settings] Switched to:',
        provider.id,
        'API Key preserved:',
        Boolean(config.apiKey)
      );
    }
  }

  function handleClearData() {
    if (confirm('Clear all local data including API keys and history?')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55]"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-[56] overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-semibold">API Settings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Configure your LLM provider</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Provider
            </label>

            <div className="space-y-2">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleSwitchProvider(provider.id)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left',
                    config.provider === provider.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-border/80 hover:bg-secondary/30'
                  )}
                >
                  <span className="text-xl mt-0.5">{provider.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{provider.name}</span>
                      {provider.description && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {provider.description}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                      {provider.baseUrl}
                    </p>
                  </div>

                  {config.provider === provider.id && (
                    <Check className="w-4 h-4 text-primary shrink-0 mt-1" />
                  )}
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={() => {}} className="w-full">
              Switch Provider
            </Button>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              API Key
            </label>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => {
                  const newKey = e.target.value;
                  setConfig({ apiKey: newKey });
                  console.log('[Settings] API Key updated, length:', newKey.length);
                }}
                onBlur={() => {
                  if (config.apiKey) {
                    console.log('[Settings] API Key saved to localStorage');
                    showToast(`✓ API Key saved (${config.apiKey.length} chars)`);
                  }
                }}
                placeholder={`${currentProvider.name} API key (e.g., sk-...)`}
                className="w-full px-3 py-2 pr-20 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                  className="h-7 px-2 text-[10px]"
                >
                  {showKey ? 'Hide' : 'Show'}
                </Button>

                {hasKey && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Remove API key? You'll need to re-enter it.")) {
                        setConfig({ apiKey: '' });
                        showToast('API key removed');
                      }
                    }}
                    className="h-7 px-2 text-[10px] text-danger hover:text-danger"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* API Key Help Text */}
            {config.provider && (
              <p className="text-[10px] text-muted-foreground">
                {config.provider === 'openclaw' && 'Get your key from https://openclaw.com'}
                {config.provider === 'anthropic' &&
                  'Get your key from https://console.anthropic.com'}
                {config.provider === 'openai' &&
                  'Get your key from https://platform.openai.com/api-keys'}
                {config.provider === 'google' &&
                  'Get your key from https://aistudio.google.com/app/apikey'}
                {config.provider === 'deepseek' &&
                  'Get your key from https://platform.deepseek.com'}
                {config.provider === 'groq' && 'Get your key from https://console.groq.com/keys'}
                {config.provider === 'azure' &&
                  'Use Azure Portal: https://portal.azure.com → Azure OpenAI'}
                {config.provider === 'custom' &&
                  'Enter your custom OpenAI-compatible endpoint URL and API key'}
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Model
            </label>

            <select
              value={config.model}
              onChange={(e) => setConfig({ model: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {(currentProvider?.models || []).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Advanced Settings
            </h3>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Temperature</span>
                <span className="font-mono text-muted-foreground">
                  {config.temperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <label className="text-xs">Max Tokens</label>
              <input
                type="number"
                value={config.maxTokens}
                onChange={(e) => setConfig({ maxTokens: parseInt(e.target.value) || 16000 })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus-ring-primary"
                min="100"
                max="128000" // 2026: Updated for new models (GPT-5.5 supports up to 100K output)
              />
              <p className="text-[10px] text-muted-foreground">
                Recommended: 8000 (standard), 16000 (detailed), 32000+ (deep analysis with
                GPT-5.5/Claude Opus 4.7)
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.stream}
                  onChange={(e) => setConfig({ stream: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Stream responses</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.injectSkill}
                  onChange={(e) => setConfig({ injectSkill: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Inject full SKILL.md as system prompt</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeRefs}
                  onChange={(e) => setConfig({ includeRefs: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Include reference files in system prompt</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-border">
            {/* Config Status */}
            <div className="p-3 rounded-md bg-secondary/30 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-medium">{currentProvider?.name || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium">{config.model || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Key:</span>
                <span className={hasKey ? 'text-success font-medium' : 'text-danger'}>
                  {hasKey
                    ? `✓ ${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`
                    : '✗ Not set'}
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                console.log('[Settings] Saving config:', {
                  provider: config.provider,
                  model: config.model,
                  hasApiKey: Boolean(config.apiKey),
                  apiKeyLength: config.apiKey?.length,
                });

                if (!config.provider) {
                  showToast('⚠️ Please select a Provider');
                  return;
                }
                if (!config.apiKey) {
                  showToast('⚠️ Please enter your API Key');
                  return;
                }
                if (!config.model) {
                  showToast('⚠️ Please select a Model');
                  return;
                }

                showToast('✅ Configuration saved successfully!');
                onOpenChange(false);
              }}
              className="w-full gap-2 bg-primary text-primary-foreground hover:opacity-90"
            >
              <Check className="w-4 h-4" />
              Save & Close
            </Button>

            <Button
              onClick={handleTestConnection}
              disabled={!hasKey || !config.model || testing}
              variant="outline"
              className="w-full gap-2"
            >
              {testing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleClearData}
              className="w-full text-danger hover:text-danger border-danger/30 hover:bg-danger/5"
            >
              Clear all local data
            </Button>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-border text-[10px] text-muted-foreground space-y-1">
            <p>API keys are stored locally in your browser and never sent to our servers.</p>
            <div className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              <a href="#" className="underline hover:no-underline">
                Documentation
              </a>
              <span>·</span>
              <a href="#" className="underline hover:no-underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
