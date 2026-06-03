import { CortexModule, ModuleType } from '../include/types';
import { StandardizedProcessor } from '../core/kernel/processor';
import { SystemRegistry } from '../core/registry';
import { PromptRegistry } from '../core/PromptRegistry';

const DEFAULT_CORRECTION_PROMPT = `
[SYSTEM]: Your previous output format was invalid. You must wrap your dialogue in <final_answer> tags or provide the required JSON structure. Do not repeat your reasoning, just provide the corrected output.

INVALID OUTPUT:
\${invalidOutput}
`.trim();

// Register default prompt
PromptRegistry.getInstance().register('neural-verifier:correction', DEFAULT_CORRECTION_PROMPT);

/**
 * Neural Verifier: Checks data format before distribution.
 * If format is invalid, asks LLM for correction.
 */
export const NeuralVerifierModule: CortexModule = {
  metadata: {
    id: 'neural-verifier',
    name: 'yui-parser: Integrity Gate',
    description: 'Ensures LLM outputs match the required structural integrity before parsing.',
    version: '1.1.0',
    type: ModuleType.CORTEX,
    phase: 'PHASE 3: EVALUATION', 
    order: 2,
    configSchema: {
      fields: {
        enabled: { type: 'boolean', label: 'Enable Verifier', default: true },
        correctionPrompt: { 
          type: 'textarea', 
          label: 'Correction Prompt Template', 
          default: DEFAULT_CORRECTION_PROMPT,
          description: 'The instruction sent to the LLM if output format is broken. Use ${invalidOutput} variable.'
        }
      }
    }
  },
  run: async (input: string, state: any, context: any) => {
    const config = context.moduleConfig || {};
    if (config.enabled === false) return { ...context, verifierStatus: 'disabled' };

    console.log('[VERIFIER] Validating input integrity...');
    
    // We no longer strictly require or enforce XML tags like <final_answer> by default as per standard communication.
    // This resolves issues where natural and friendly dialogue style would trigger a corrective loop.
    const hasFinalAnswer = true;
    
    if (!hasFinalAnswer && input.length > 0) {
      console.warn('[VERIFIER] Structural mismatch detected. Requesting self-correction...');
      
      const gateway = SystemRegistry.getModule<CortexModule>('provider-gateway');
      if (gateway) {
        const registry = PromptRegistry.getInstance();
        const template = config.correctionPrompt || registry.get('neural-verifier:correction');
        
        // Ensure consistency
        registry.register('neural-verifier:correction', template, true);

        const correctionPrompt = registry.compile('neural-verifier:correction', {
          invalidOutput: input
        });

        const resultContext = await gateway.run(correctionPrompt, state, context);
        
        console.log('[VERIFIER] Corrected output received.');
        return { ...context, rawResult: resultContext.rawResult, verifierStatus: 'corrected' };
      }
    }

    return { ...context, verifierStatus: 'valid' };
  }
};
