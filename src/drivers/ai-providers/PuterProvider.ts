import { ProviderModule, ModuleType } from '../../include/types';
import { NeuralProcessor } from '../../core/kernel/processor';

/**
 * PuterProvider: Mengizinkan Yuihime menggunakan Puter.js sebagai mesin pemrosesan neural utama.
 * Sangat berguna untuk menghemat token pada tugas-tugas sederhana.
 */
export const PuterProvider: ProviderModule = {
  metadata: {
    id: 'puter-neural-provider',
    name: 'Puter Cloud Provider',
    description: 'Neural provider menggunakan infrastruktur Puter.js (Gratis & Cepat)',
    version: '1.0.0',
    type: ModuleType.PROVIDER,
    order: 10,
    models: [
      'openai:gpt-4o-mini', 
      'openai:gpt-4o', 
      'anthropic:claude-3-5-sonnet-20240620', 
      'anthropic:claude-3-opus-20240229', 
      'openai:o1-mini', 
      'google:gemini-1.5-flash'
    ],
    configSchema: {
      fields: {
        model: {
          type: 'select',
          label: 'AI Model (Puter)',
          default: 'openai:gpt-4o-mini',
          dynamicOptions: true,
          options: [
            { label: 'OpenAI: GPT-4o Mini', value: 'openai:gpt-4o-mini' },
            { label: 'OpenAI: GPT-4o', value: 'openai:gpt-4o' },
            { label: 'Anthropic: Claude 3.5 Sonnet', value: 'anthropic:claude-3-5-sonnet-20240620' },
            { label: 'Anthropic: Claude 3 Opus', value: 'anthropic:claude-3-opus-20240229' },
            { label: 'OpenAI: o1-mini', value: 'openai:o1-mini' },
            { label: 'Google: Gemini 1.5 Flash', value: 'google:gemini-1.5-flash' }
          ]
        },
        token: {
          type: 'password',
          label: 'Puter Auth Token (Optional)',
          description: 'Hanya jika Anda menggunakan token kustom.'
        }
      }
    }
  },

  async generate(input: string, options: any = {}) {
    console.log('[PUTER-PROVIDER] Neural Processing via Puter.js...');
    
    try {
      const { SystemRegistry } = await import('../../core/registry');
      const puterTool = SystemRegistry.getTool('addon-puter_hub');
      
      if (!puterTool) {
        throw new Error('Puter Hub Addon is not registered in the system.');
      }

      // Try to get token from systemic context or options
      const config = await SystemRegistry.getConfig(this.metadata.id);
      const token = options.token || config.token || options.apiKey || config.apiKey;

      const result = await puterTool.execute({
        action: 'chat',
        input: input,
        model: options.model || 'gpt-4o-mini',
        token: token
      }, {});

      // Addon execute returns { stdout, stderr, success }
      // The bridge main.cjs outputs JSON string to stdout
      console.log('[PUTER-PROVIDER] Exec result:', result);

      if (result && result.success) {
        if (!result.stdout || result.stdout.trim() === '') {
           console.error('[PUTER-PROVIDER] Error: Result success but empty stdout. Stderr:', result.stderr);
           return `[PUTER-ERROR] Result success but empty stdout. Stderr: ${result.stderr || 'none'}`;
        }

        let parsed;
        try {
          // Attempt to find JSON in stdout (in case there's logging noise)
          const jsonMatch = result.stdout.match(/\{.*\}/s);
          const jsonStr = jsonMatch ? jsonMatch[0] : result.stdout;
          parsed = JSON.parse(jsonStr);
          console.log('[PUTER-PROVIDER] Parsed response:', parsed);
        } catch (e) {
          console.error('[PUTER-PROVIDER] JSON Parse Error:', e, 'Raw stdout:', result.stdout);
          parsed = { message: result.stdout };
        }

        return parsed.message || parsed.content || parsed.text || `[PUTER-RESPONSE] ${JSON.stringify(parsed)}`;
      }
      console.error('[PUTER-PROVIDER] Execution failed:', result?.error, 'Stderr:', result?.stderr);
      return `[PUTER-EXEC-FAILED] ${result?.error || 'Unknown error'}. Stderr: ${result?.stderr || ''}`;
    } catch (e: any) {
      console.error('[PUTER-PROVIDER] Error:', e);
      throw e;
    }
  },

  async getDynamicOptions(fieldName: string, config: any) {
    if (fieldName === 'model') {
      return this.getModels(config);
    }
    return [];
  },

  async getModels(config: any) {
    try {
      const { SystemRegistry } = await import('../../core/registry');
      const puterTool = SystemRegistry.getTool('addon-puter_hub');
      if (!puterTool) return [];

      const result = await puterTool.execute({
        action: 'list_models',
        token: config.token || config.apiKey
      }, {});

      if (result && result.success && result.stdout) {
        const jsonMatch = result.stdout.match(/(\{.*\}|\[.*\])/s);
        const jsonStr = jsonMatch ? jsonMatch[0] : result.stdout;
        const parsed = JSON.parse(jsonStr);
        console.log('[PUTER-PROVIDER] Parsed response:', parsed);
        
        let modelsArray: any[] = [];
        if (Array.isArray(parsed)) {
          modelsArray = parsed;
        } else if (parsed && Array.isArray(parsed.models)) {
          modelsArray = parsed.models;
        } else if (parsed && parsed.success && Array.isArray(parsed.models)) {
          modelsArray = parsed.models;
        }

        if (modelsArray.length > 0) {
          return modelsArray.map((m: any) => ({
             label: `${m.provider ? m.provider.toUpperCase() + ': ' : ''}${m.name || m.id || 'Unknown'}`,
             value: m.provider ? `${m.provider}:${m.id || m.name}` : (m.id || m.name)
          }));
        }
      }
      return [];
    } catch (e) {
      console.error('[PUTER-PROVIDER] Failed to fetch models:', e);
      return [];
    }
  }
};
