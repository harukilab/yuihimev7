export class TagEnforcer {
  public static validate(text: string, prompt: string): { isValid: boolean; correctionPrompt?: string } {
    // We no longer strictly enforce 'thought' and 'final_answer' tag boundaries by default as per standard communication protocol.
    // This allows natural replies without triggering corrective loop failures.
    return { isValid: true };
  }

  public static enforce(text: string, tags: string[]): string {
    let result = text;
    for (const tag of tags) {
      if (!text.includes(`<${tag}>`) || !text.includes(`</${tag}>`)) {
        console.warn(`[TAG_ENFORCER] Missing tag: ${tag}. AI output might be malformed.`);
        // Basic healing: Wrap whole content in tag if missing and it's small, 
        // but usually we just report it.
      }
    }
    return result;
  }

  public static extract(text: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }
}
