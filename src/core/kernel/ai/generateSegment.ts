import { SettingsManager } from '../settings.js';
import { AIConfig } from './aiTypes.js';

export async function generateContent(
  prompt: string,
  config: AIConfig & { apiKey?: string } = {}
): Promise<string> {
  const settings = SettingsManager.getInstance();
  const geminiSettings = settings.get('gemini') || {};
  const model = config.model || geminiSettings.model || 'gemini-3.5-flash';
  const fallbackModel = geminiSettings.fallbackModel;
  const fallbackApiKey = geminiSettings.fallbackApiKey;
  
  const cleanModelId = model.replace(/^models\//, '');
  const cleanFallbackModelId = fallbackModel ? fallbackModel.replace(/^models\//, '') : undefined;

  const runWithRetries = async (customPrompt?: string): Promise<string> => {
    const activePrompt = customPrompt || prompt;
    const primaryKey = config.apiKey || settings.getApiKey();
    const fallbackKey = fallbackApiKey;

    // Prioritas sirkuit kognitif yang akan dicoba
    const attemptsToTry: Array<{ apiKey: string; modelId: string; label: string }> = [];

    // 1. Utama: Key Utama + Model Utama
    if (primaryKey) {
      attemptsToTry.push({
        apiKey: primaryKey,
        modelId: cleanModelId,
        label: `Utama (Key Utama + Model ${cleanModelId})`
      });
    }

    // 2. Cadangan Model: Key Utama + Model Cadangan (Pilihan User)
    if (primaryKey && cleanFallbackModelId && cleanFallbackModelId !== cleanModelId) {
      attemptsToTry.push({
        apiKey: primaryKey,
        modelId: cleanFallbackModelId,
        label: `Cadangan Model (Key Utama + Model ${cleanFallbackModelId})`
      });
    }

    // 3. Cadangan API: Key Cadangan + Model Utama
    if (fallbackKey && fallbackKey !== primaryKey) {
      attemptsToTry.push({
        apiKey: fallbackKey,
        modelId: cleanModelId,
        label: `Cadangan API (Key Cadangan + Model ${cleanModelId})`
      });

      // 4. Cadangan Total: Key Cadangan + Model Cadangan
      if (cleanFallbackModelId) {
        attemptsToTry.push({
          apiKey: fallbackKey,
          modelId: cleanFallbackModelId,
          label: `Cadangan Total (Key Cadangan + Model ${cleanFallbackModelId})`
        });
      }
    }

    // 5. Resilience: Cadangan jika semua konfigurasi user gagal (Dapat dikonfigurasi dinamis oleh user)
    let stables = [
      'gemini-1.5-flash',       // Ultra-stable industry benchmark fallback with massive free quota
      'gemini-2.5-flash',       // Regular modern stable
      'gemini-2.0-flash',       // Fast stable
      'gemini-3.5-flash',       // Advanced experimental
      'gemini-3.1-flash-lite',  // Sandbox preview
      'gemini-3.1-pro-preview'  // Heavy reasoning preview
    ];
    if (geminiSettings.resilienceModels) {
      stables = geminiSettings.resilienceModels
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }
    for (const stable of stables) {
      if (stable !== cleanModelId && stable !== cleanFallbackModelId) {
        if (primaryKey) {
          attemptsToTry.push({
            apiKey: primaryKey,
            modelId: stable,
            label: `Resilience Utama (Key Utama + Model ${stable})`
          });
        }
        if (fallbackKey && fallbackKey !== primaryKey) {
          attemptsToTry.push({
            apiKey: fallbackKey,
            modelId: stable,
            label: `Resilience Cadangan (Key Cadangan + Model ${stable})`
          });
        }
      }
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const rateLimitedKeys = new Set<string>();
    let lastError: any = null;
    for (const attempt of attemptsToTry) {
      if (!attempt.apiKey) continue;
      
      if (rateLimitedKeys.has(attempt.apiKey)) {
        const hasOtherGoodKey = attemptsToTry.some(a => a.apiKey && a.apiKey !== attempt.apiKey && !rateLimitedKeys.has(a.apiKey));
        if (hasOtherGoodKey) {
          console.log(`[SERVER_AI] Memangkas / skip sirkuit: ${attempt.label} karena API Key ini terdeksi limit kuota (429) dan ada API Key cadangan lain.`);
          continue;
        }
      }
      
      const maxRetriesPerAttempt = 3;
      for (let retryCount = 0; retryCount < maxRetriesPerAttempt; retryCount++) {
        try {
          if (retryCount > 0) {
            let backoffMs = Math.pow(2, retryCount) * 1000; // Base backoff 2s, 4s

            if (lastError) {
              const lastErrBody = lastError.message || String(lastError);
              const retryMatch = lastErrBody.match(/Please retry in ([0-9.]+)\s*s/i);
              if (retryMatch && retryMatch[1]) {
                const cooldownSec = parseFloat(retryMatch[1]);
                if (!isNaN(cooldownSec)) {
                  backoffMs = Math.ceil(cooldownSec * 1000) + 1500; // sleep cooldown + 1.5s security buffer
                  console.warn(`[SERVER_AI] Mengaplikasikan penundaan kognitif cerdas (API rate limit 429) sebesar ${backoffMs}ms sebelum retry #${retryCount}...`);
                }
              } else if (lastErrBody.includes('503') || lastErrBody.toLowerCase().includes('overloaded') || lastErrBody.toLowerCase().includes('unavailable')) {
                backoffMs = Math.pow(2, retryCount) * 3000; // 6s, 12s backoff for 503 overloaded
                console.warn(`[SERVER_AI] Google API mendeteksi overload (503). Menjadwalkan pending sebesar ${backoffMs}ms sebelum retry #${retryCount}...`);
              }
            }

            console.log(`[SERVER_AI] Retrying attempt ${attempt.label} (retry #${retryCount}) in ${backoffMs}ms...`);
            await sleep(backoffMs);
          }

          console.log(`[SERVER_AI] Mencoba sirkuit kognitif: ${attempt.label} (Percobaan #${retryCount + 1})...`);
          
          const finalBaseUrl = (geminiSettings.baseUrl || geminiSettings.endpoint || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
          const apiVersion = geminiSettings.apiVersion || 'v1beta';
          
          let targetUrl = '';
          if (finalBaseUrl.includes('/models/') || finalBaseUrl.includes(':generateContent')) {
            targetUrl = finalBaseUrl;
          } else {
            targetUrl = `${finalBaseUrl}/${apiVersion}/models/${attempt.modelId}:generateContent?key=${attempt.apiKey}`;
          }

          const genConfig: any = {
            temperature: (config.temperature ?? 0.7) > 0 ? (config.temperature ?? 0.7) : 0,
            topP: config.topP ?? 0.95,
            topK: config.topK ?? 40,
            maxOutputTokens: config.maxOutputTokens || geminiSettings.maxOutputTokens || 32768,
          };
          if (config.isJson) {
            genConfig.responseMimeType = "application/json";
          }

          let systemInstructionText = config.systemInstruction;
          
          let contentsArray: any[] = [];
          if (attempt.modelId.includes('gemma') || attempt.modelId.includes('gemma-4')) {
            // For Gemma models, prepend the system instruction directly into the user contents to ensure it is obeyed!
            const promptWithSystem = systemInstructionText 
              ? `[SYSTEM INSTRUCTION & PERSONALITY]\n${systemInstructionText}\n\n[USER INPUT]\n${activePrompt}`
              : activePrompt;
            contentsArray = [{ role: 'user', parts: [{ text: promptWithSystem }] }];
            systemInstructionText = undefined; // clear out systemInstruction to prevent API mismatch/ignore
          } else {
            contentsArray = [{ role: 'user', parts: [{ text: activePrompt }] }];
          }

          const requestBody: any = {
            contents: contentsArray,
            generationConfig: genConfig,
          };

          if (systemInstructionText) {
            requestBody.systemInstruction = {
              parts: [{ text: systemInstructionText }]
            };
          }

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build'
          };

          // If standard domain is replaced or user specified useHeaderOption, map authorization headers
          if (geminiSettings.useHeaderApiKey || finalBaseUrl.includes('api.openai.com') || finalBaseUrl.includes('openrouter.ai')) {
            headers['Authorization'] = `Bearer ${attempt.apiKey}`;
            headers['x-goog-api-key'] = attempt.apiKey;
          }

          const fetchController = new AbortController();
          const requestTimeout = setTimeout(() => fetchController.abort(), 90000); // 90 second generation limit
          
          const res = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
            signal: fetchController.signal
          });
          clearTimeout(requestTimeout);

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP Error ${res.status}: ${errText}`);
          }

          const resJson: any = await res.json();
          const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error(`Invalid response schema from Gemini API: ${JSON.stringify(resJson)}`);
          }
          
          console.log(`[SERVER_AI] Sirkuit kognitif berdenyut sukses (NATIVE FETCH) dengan ${attempt.label}.`);
          return text;
        } catch (error: any) {
          lastError = error;
          const errorBody = error.message || String(error);
          console.error(`[SERVER_AI] Sirkuit ${attempt.label} gagal pada Percobaan #${retryCount + 1}:`, errorBody);
          
          const isRetriable = errorBody.includes('503') || 
                              errorBody.includes('429') || 
                              errorBody.toLowerCase().includes('overloaded') || 
                              errorBody.toLowerCase().includes('quota') || 
                              errorBody.toLowerCase().includes('rate') || 
                              errorBody.toLowerCase().includes('exhausted') ||
                              errorBody.toLowerCase().includes('temporary') ||
                              errorBody.toLowerCase().includes('demand') ||
                              errorBody.toLowerCase().includes('unavailable');
          
          // If out of quota, register API key in blocklist temporarily for this cycle
          if (errorBody.includes('429') || errorBody.toLowerCase().includes('quota') || errorBody.toLowerCase().includes('rate') || errorBody.toLowerCase().includes('exhausted')) {
            console.warn(`[SERVER_AI] API Key ${attempt.apiKey.substring(0, 6)}... terdeteksi kehabisan kuota (429). Mencegah sirkuit lanjutan memakai key ini jika ada key cadangan lain.`);
            rateLimitedKeys.add(attempt.apiKey);
          }

          if (!isRetriable || retryCount === maxRetriesPerAttempt - 1) {
            break;
          }
        }
      }
    }

    if (attemptsToTry.length === 0) {
      throw new Error("Semua sirkuit kognitif dan jalur cadangan AI gagal: Tidak ada API Key yang dikonfigurasi untuk Gemini. Silakan isi API Key Anda di panel Settings (tab Providers atau tab System) di antarmuka web Yuihime, atau setel variabel lingkungan GEMINI_API_KEY di berkas .env / config.toml Anda!");
    }

    throw lastError || new Error("Semua sirkuit kognitif dan jalur cadangan AI gagal.");
  };

  let response: string;
  try {
    response = await runWithRetries();
  } catch (primaryErr: any) {
    const fallbackChain = geminiSettings.fallbackChain || [];
    if (fallbackChain && fallbackChain.length > 0) {
      console.log(`[SERVER_AI] All standard Gemini attempts failed. Entering user's custom fallbackChain cascade...`);
      let successResponse: string | null = null;
      for (const item of fallbackChain) {
        const providerId = item.provider;
        const modelId = item.model;
        const customApiKey = item.apiKey;
        const customBaseUrl = item.baseUrl;

        try {
          let resolvedProviderId = providerId;
          let baseUrlOverride = undefined;
          if (providerId === 'ollama') {
            resolvedProviderId = 'local';
          } else if (providerId === 'deepseek' || providerId === 'groq') {
            resolvedProviderId = 'openai';
            baseUrlOverride = providerId === 'deepseek'
              ? 'https://api.deepseek.com/v1'
              : 'https://api.groq.com/openai/v1';
          }

          const { SystemRegistry } = await import('../../registry.js');
          const provider = SystemRegistry.getProvider(resolvedProviderId);
          if (provider) {
            console.log(`[SERVER_AI_FALLBACK] Attempting fallback step to provider: ${providerId} (using actual driver: ${resolvedProviderId}, model: ${modelId})`);
            const fallbackConfig = {
              ...(config || {}),
              ...(settings.get(resolvedProviderId) || {}),
              ...(settings.get(providerId) || {}),
              model: modelId,
              apiKey: customApiKey || settings.get(providerId)?.apiKey || settings.get(resolvedProviderId)?.apiKey
            };
            if (customBaseUrl) {
              fallbackConfig.baseUrl = customBaseUrl;
            } else if (baseUrlOverride) {
              fallbackConfig.baseUrl = baseUrlOverride;
            }
            
            const result = await provider.generate(prompt, {
              systemInstruction: config.systemInstruction,
              config: fallbackConfig
            });
            
            console.log(`[SERVER_AI_FALLBACK] Fallback step to ${providerId} succeeded!`);
            successResponse = result;
            break;
          }
        } catch (fbErr: any) {
          console.error(`[SERVER_AI_FALLBACK] Fallback step to ${providerId} failed:`, fbErr.message);
        }
      }
      if (successResponse !== null) {
        response = successResponse;
      } else {
        throw primaryErr;
      }
    } else {
      throw primaryErr;
    }
  }
  let rawResponse = response;

  // --- UNIVERSAL TAG ENFORCEMENT ---
  const systemInstructionText = config.systemInstruction || '';
  const isDialogue = !config.isJson && (
    prompt.includes('[IDENTITY]') || 
    prompt.includes('[CHARACTER]') || 
    prompt.includes('<thought>') || 
    systemInstructionText.includes('Yuihime') || 
    systemInstructionText.includes('<thought>')
  );
  
  if (isDialogue) {
    const { TagEnforcer } = await import('../TagEnforcer.js');
    const validation = TagEnforcer.validate(rawResponse, prompt);
    
    if (!validation.isValid && validation.correctionPrompt) {
      console.warn("[KERNEL] Tag validation failed. Retrying with correction...");
      try {
        rawResponse = await runWithRetries(`${prompt}\n\n${validation.correctionPrompt}`);
      } catch (e) {
        console.error("[KERNEL] Correction retry failed", e);
      }
    }
  }

  return rawResponse;
}
