import { logger } from './kernel/logger';

/**
 * PromptRegistry: Centralized storage for all LLM prompt templates.
 * Allows modules to register their prompts and allows them to be overridden via settings.
 */
export class PromptRegistry {
  private static instance: PromptRegistry;
  private templates: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry();
    }
    return PromptRegistry.instance;
  }

  /**
   * Registers a prompt template.
   * @param id Unique identifier for the prompt (e.g., 'dream-simulation:main')
   * @param template The template string
   * @param overwrite If true, overwrites existing template
   */
   public register(id: string, template: any, overwrite: boolean = false) {
    if (!template || typeof template !== 'string') {
      logger.log('WARN', 'PROMPT_REGISTRY', `Attempted to register invalid template for ${id}. Type: ${typeof template}`);
      return;
    }
    if (this.templates.has(id) && !overwrite) {
      logger.log('DEBUG', 'PROMPT_REGISTRY', `Prompt ${id} already registered. Skipping.`);
      return;
    }
    this.templates.set(id, template.trim());
  }

  /**
   * Retrieves a registered prompt template.
   * @param id The prompt identifier
   * @returns The template string or a fallback error message
   */
  public get(id: string): string {
    const template = this.templates.get(id);
    if (!template) {
      logger.log('WARN', 'PROMPT_REGISTRY', `Prompt template ${id} not found.`);
      return `[ERROR: Prompt ${id} not found]`;
    }
    return template;
  }

  /**
   * Compiles a template using basic variable injection.
   * Supports ${variable} syntax.
   */
  public compile(id: string, variables: Record<string, any> = {}): string {
    let template = this.get(id);
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `\${${key}}`;
      template = template.split(placeholder).join(String(value));
    }
    
    return template;
  }

  public getAllIds(): string[] {
    return Array.from(this.templates.keys());
  }
}
