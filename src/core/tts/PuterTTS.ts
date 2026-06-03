import { TTSModule, ModuleType } from '../../include/types';

/**
 * PuterTTS: Text-to-Speech via Puter.js Infrastructure.
 */
export const PuterTTS: TTSModule = {
  metadata: {
    id: 'puter-tts',
    name: 'Puter TTS (Cloud)',
    description: 'Cloud-based TTS provided by Puter.js Infrastructure.',
    version: '1.0.0',
    type: ModuleType.TTS,
    order: 5,
    configSchema: {
      fields: {
        voice: {
          type: 'select',
          label: 'Voice Pattern',
          default: 'en-US-1',
          options: [
            { label: 'English (US) - 1', value: 'en-US-1' },
            { label: 'English (US) - 2', value: 'en-US-2' },
            { label: 'English (UK) - 1', value: 'en-GB-1' },
            { label: 'Japanese - 1', value: 'ja-JP-1' },
            { label: 'Indonesian - 1', value: 'id-ID-1' }
          ]
        },
        token: {
          type: 'password',
          label: 'Puter Auth Token (Optional)',
          description: 'Uses global token if empty.'
        }
      }
    }
  },

  speak: async (text: string, config: any) => {
    try {
      const { SystemRegistry } = await import('../registry');
      const puterTool = SystemRegistry.getTool('addon-puter_hub');
      
      if (!puterTool) {
        throw new Error('Puter Hub Addon not found.');
      }

      const result = await puterTool.execute({
        action: 'tts',
        input: text,
        voice: config.voice || 'en-US-1',
        token: config.token || config.apiKey
      }, {});

      if (result && result.success && result.url) {
        const audio = new Audio(result.url);
        await audio.play();
        return new Promise((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
        });
      }
    } catch (e) {
      console.error('[PUTER-TTS] Error:', e);
      // Fallback
    }
  }
};
