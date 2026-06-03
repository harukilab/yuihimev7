import { CortexModule, ModuleType } from '../../include/types';
import { PromptRegistry } from '../../core/PromptRegistry';

const DEFAULT_CORRECTION_HINT = "The previous response indicated an error or lack of knowledge. Can you try a different approach or use a tool to verify?";

// Register default prompt/hint
PromptRegistry.getInstance().register('self-correction:hint', DEFAULT_CORRECTION_HINT);

export const SelfCorrectionModule: CortexModule = {
  metadata: {
    id: 'self-correction',
    name: 'Neural Verifier (Self-Correction)',
    description: 'Evaluates agent output for accuracy and fixes errors automatically.',
    version: '1.1.0',
    type: ModuleType.CORTEX,
    order: 10,
    phase: 'PHASE 4: OPTIMIZATION',
    configSchema: {
      fields: {
        enabled: { type: 'boolean', label: 'Enabled', default: true },
        errorKeywords: { 
          type: 'string', 
          label: 'Error Keywords (comma separated)', 
          default: "error, don't know, cannot help",
          description: 'Words that trigger a self-correction request.'
        },
        correctionPrompt: {
          type: 'textarea',
          label: 'Correction Feedback',
          default: DEFAULT_CORRECTION_HINT,
          description: 'Feedback sent to LLM for the next cycle.'
        }
      }
    }
  },
  run: async (input, state, context) => {
    const config = context.moduleConfig || {};
    if (config.enabled === false) return { ...context };

    const response = context.processedResponse || input;
    const logs = context.logs || [];

    const lowerResponse = (response || "").toLowerCase();
    const keywords = (config.errorKeywords || "error, don't know").split(',').map((k: string) => k.trim().toLowerCase());
    
    const hasError = keywords.some((k: string) => lowerResponse.includes(k));

    if (hasError) {
      logs.push("[VERIFIER] Potential error detected in output. Suggesting retry logic.");
      const registry = PromptRegistry.getInstance();
      const hint = config.correctionPrompt || registry.get('self-correction:hint');
      
      return { 
        ...context,
        requiresCorrection: true,
        correctionPrompt: hint
      };
    }

    return { ...context };
  }
};
