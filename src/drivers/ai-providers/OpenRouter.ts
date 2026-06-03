import { ProviderModule, ModuleType } from '../../include/types';

export const OpenRouter: ProviderModule = {
  metadata: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Universal gateway for multiple LLMs.',
    version: '1.0.0',
    type: ModuleType.PROVIDER,
    order: 2,
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001'],
    configSchema: {
      fields: {
        apiKey: { type: 'password', label: 'API Key', description: 'OpenRouter API Key' },
        model: { 
          type: 'select', 
          label: 'Model Selection', 
          dynamicOptions: true,
          default: 'google/gemini-2.0-flash-001',
          description: 'Select a model from OpenRouter' 
        }
      }
    }
  },
  getDynamicOptions: async (fieldName: string, config: any) => {
    if (fieldName === 'model') {
      try {
        const apiKey = config.apiKey || '';
        const url = apiKey ? `/api/ai/models?provider=openrouter&apiKey=${apiKey}` : '/api/ai/models?provider=openrouter';
        const resp = await fetch(url);
        if (!resp.ok) return [];
        const data = await resp.json();
        return (data.models || []).map((m: any) => ({ 
          label: m.displayName || m.name.split('/').pop(), 
          value: m.name.replace('models/', '') 
        }));
      } catch (e) {
        console.error("[OPENROUTER] Model listing failed:", e);
        return [];
      }
    }
    return [];
  },
  getModels: async (config: any) => {
    // Keep for backward compatibility with some core loops if needed
    try {
      const apiKey = config.apiKey || '';
      const url = apiKey ? `/api/ai/models?provider=openrouter&apiKey=${apiKey}` : '/api/ai/models?provider=openrouter';
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.models || []).map((m: any) => ({ 
        label: m.displayName || m.name.split('/').pop(), 
        value: m.name.replace('models/', '') 
      }));
    } catch (e) {
      console.error("[OPENROUTER] Model listing failed:", e);
      return [];
    }
  },
  generate: async (prompt: string, context: any) => {
    const config = context.config?.openrouter || context.config || (context.model ? context : {});
    const apiKey = config.apiKey || config.api_key || '';
    const googleModel = context.model || config.model || 'google/gemini-2.0-flash-001';

    const payloadBody: any = {
      model: googleModel,
      messages: [
        { role: 'system', content: context.assembledSystemPrompt || 'You are an AI assistant.' },
        { role: 'user', content: prompt }
      ]
    };

    if (config.isJson) {
      payloadBody.response_format = { type: 'json_object' };
    }

    const response = await fetch('/api/ai/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://openrouter.ai/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': apiKey ? `Bearer ${apiKey}` : 'ENV_OPENROUTER_KEY',
          'HTTP-Referer': 'https://aistudio.build',
          'X-Title': 'Yuihime Agentic'
        },
        body: payloadBody
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenRouter Proxy Error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }
};
