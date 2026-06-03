import { StorageService } from '../../drivers/storage';

let settingsCache: any = null;
let lastSettingsFetch: number = 0;

/**
 * Normalizes and retrieves the combined settings for the Cortex, with caching.
 *
 * Use when:
 * - Direct query parameters or prompt-gateway requests require active provider credentials.
 *
 * Returns:
 * - A unified JSON settings structure containing the current provider config.
 */
export async function fetchCortexSettings(localConfigOverride?: any): Promise<any> {
  if (settingsCache && (Date.now() - lastSettingsFetch < 30000)) {
    return settingsCache;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const serverSettings = await fetch('/api/settings', { signal: controller.signal })
      .then(res => res.ok ? res.json() : {})
      .catch(() => ({}));
    
    clearTimeout(timeoutId);
    const s = serverSettings as any;
    const localConfig = localConfigOverride || await StorageService.getAIConfig();
    
    const activeProvider = localConfig.provider || s.provider || 'gemini';
    
    const combined = { ...s };
    if (!combined[activeProvider]) combined[activeProvider] = {};
    
    combined[activeProvider] = {
      apiKey: combined[activeProvider].apiKey || localConfig.apiKey || '',
      model: combined[activeProvider].model || localConfig.model || 'gemini-3-flash-preview',
      temperature: combined[activeProvider].temperature || localConfig.temperature || 0.7,
      topP: combined[activeProvider].topP || localConfig.topP || 0.95,
      topK: combined[activeProvider].topK || localConfig.topK || 40,
      maxOutputTokens: combined[activeProvider].maxOutputTokens || localConfig.maxTokens || 2048
    };

    combined.provider = activeProvider;

    settingsCache = combined;
    lastSettingsFetch = Date.now();
    return combined;
  } catch (e) {
    console.warn("[CORTEX] Settings fetch failed, using fallback/cache.", e);
    if (settingsCache) return settingsCache;

    const localConfig = localConfigOverride || await StorageService.getAIConfig();
    const prov = localConfig.provider || 'gemini';
    return { 
      provider: prov,
      [prov]: { 
        apiKey: localConfig.apiKey || '', 
        model: localConfig.model || 'gemini-3-flash-preview' 
      } 
    };
  }
}

export function clearCortexSettingsCache(): void {
  settingsCache = null;
  lastSettingsFetch = 0;
}
